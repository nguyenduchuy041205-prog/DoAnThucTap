import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { QrStatus } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../../common/prisma.service'
import { AuditService } from '../audit/audit.service'
import { QrConditionService } from './qr-condition.service'

@Injectable()
export class QrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conditions: QrConditionService,
    private readonly audit: AuditService,
  ) {}

  async generate(seasonLotId: string, expiresAt?: Date, requestedBy?: string) {
    if (expiresAt && expiresAt <= new Date()) throw new ConflictException('expiresAt phải là thời điểm trong tương lai.')
    const check = await this.conditions.check(seasonLotId)
    if (!check.canGenerateQR) {
      throw new UnprocessableEntityException({
        code: 'QR_CONDITIONS_NOT_MET',
        message: 'Chưa đủ điều kiện phát hành QR.',
        blockedBy: check.blockedBy,
        details: check.details,
      })
    }

    const existing = await this.prisma.qrCode.findFirst({
      where: { seasonLotId, status: { in: [QrStatus.PENDING, QrStatus.ACTIVE] } },
      select: { id: true },
    })
    if (existing) throw new ConflictException('Lô mùa vụ đã có QR đang chờ duyệt hoặc đang hoạt động.')

    const qr = await this.prisma.qrCode.create({
      data: {
        seasonLotId,
        token: randomUUID(),
        expiresAt: expiresAt ?? null,
        conditionDiaryOk: check.conditionDiaryOk,
        conditionQuarantineOk: check.conditionQuarantineOk,
        conditionQualityOk: check.conditionQualityOk,
      },
      select: {
        id: true,
        token: true,
        status: true,
        conditionDiaryOk: true,
        conditionQuarantineOk: true,
        conditionQualityOk: true,
        createdAt: true,
        expiresAt: true,
      },
    })
    this.audit.log({
      userId: requestedBy,
      action: 'QR_REQUEST_CREATED',
      entityType: 'QR_CODE',
      entityId: qr.id,
      newValues: { seasonLotId, status: qr.status },
    })
    return {
      id: qr.id,
      token: qr.token,
      status: qr.status,
      conditionSnapshot: {
        conditionDiaryOk: qr.conditionDiaryOk,
        conditionQuarantineOk: qr.conditionQuarantineOk,
        conditionQualityOk: qr.conditionQualityOk,
      },
      message: 'Yêu cầu phát hành QR đã được gửi. Chờ Ban Quản trị HTX duyệt.',
    }
  }

  generateQRRequest(seasonLotId: string, requestedBy: string, expiresAt?: Date) {
    return this.generate(seasonLotId, expiresAt, requestedBy)
  }

  async approve(qrId: string, approvedBy: string) {
    const qr = await this.prisma.qrCode.findUnique({ where: { id: qrId }, select: { id: true, seasonLotId: true, status: true, token: true, expiresAt: true } })
    if (!qr) throw new NotFoundException('Không tìm thấy yêu cầu QR.')
    if (qr.status !== QrStatus.PENDING) throw new ConflictException('QR không ở trạng thái chờ duyệt.')
    if (qr.expiresAt && qr.expiresAt <= new Date()) throw new ConflictException('Yêu cầu QR đã hết hạn.')

    // Recheck at approval time: a pending request must not bypass conditions that changed.
    const check = await this.conditions.check(qr.seasonLotId)
    if (!check.canGenerateQR) {
      throw new UnprocessableEntityException({
        code: 'QR_CONDITIONS_NOT_MET',
        message: 'Điều kiện phát hành QR đã thay đổi; chưa thể duyệt.',
        blockedBy: check.blockedBy,
      })
    }

    const baseUrl = (process.env.PUBLIC_TRACE_BASE_URL ?? 'https://trace.cropcoop.vn').replace(/\/$/, '')
    const publicUrl = `${baseUrl}/trace/${qr.token}`

    const approvedAt = new Date()
    const result = await this.prisma.$transaction(async (tx) => {
      const unconfirmedDiaries = await tx.diaryEntry.count({
        where: { seasonLotId: qr.seasonLotId, status: { notIn: ['CONFIRMED', 'LOCKED'] } },
      })
      if (unconfirmedDiaries > 0) {
        throw new UnprocessableEntityException({
          code: 'QR_CONDITIONS_NOT_MET',
          message: 'Có nhật ký chưa được xác nhận; chưa thể duyệt QR.',
          blockedBy: ['conditionDiaryOk'],
        })
      }
      const updated = await tx.qrCode.updateMany({
        where: { id: qrId, status: QrStatus.PENDING },
        data: {
          status: QrStatus.ACTIVE,
          publicUrl,
          approvedBy,
          approvedAt,
          conditionDiaryOk: check.conditionDiaryOk,
          conditionQuarantineOk: check.conditionQuarantineOk,
          conditionQualityOk: check.conditionQualityOk,
        },
      })
      if (updated.count !== 1) throw new ConflictException('Yêu cầu QR đã được xử lý đồng thời.')

      const locked = await tx.diaryEntry.updateMany({
        where: { seasonLotId: qr.seasonLotId, status: 'CONFIRMED' },
        data: { status: 'LOCKED', lockedAt: new Date() },
      })
      return {
        id: qr.id,
        token: qr.token,
        status: QrStatus.ACTIVE,
        publicUrl,
        approvedBy,
        approvedAt,
        lockedDiaryCount: locked.count,
      }
    })
    this.audit.log({
      userId: approvedBy,
      action: 'QR_APPROVED',
      entityType: 'QR_CODE',
      entityId: qrId,
      newValues: { status: QrStatus.ACTIVE, publicUrl, lockedDiaryCount: result.lockedDiaryCount },
    })
    return result
  }

  approveQR(qrId: string, approvedBy: string) {
    return this.approve(qrId, approvedBy)
  }

  async revoke(qrId: string, revokedBy: string, reason: string) {
    if (!reason.trim()) throw new ConflictException('Cần có lý do thu hồi mã QR.')
    const updated = await this.prisma.qrCode.updateMany({
      where: { id: qrId, status: QrStatus.ACTIVE },
      data: { status: QrStatus.REVOKED, revokedBy, revokedAt: new Date(), revokeReason: reason },
    })
    if (updated.count === 0) {
      const exists = await this.prisma.qrCode.findUnique({ where: { id: qrId }, select: { id: true } })
      if (!exists) throw new NotFoundException('Không tìm thấy mã QR.')
      throw new ConflictException('Chỉ có thể thu hồi QR đang hoạt động.')
    }
    const revoked = await this.prisma.qrCode.findUniqueOrThrow({ where: { id: qrId } })
    this.audit.log({
      userId: revokedBy,
      action: 'QR_REVOKED',
      entityType: 'QR_CODE',
      entityId: qrId,
      newValues: { status: QrStatus.REVOKED, reason },
    })
    return revoked
  }

  revokeQR(qrId: string, revokedBy: string, reason: string) {
    return this.revoke(qrId, revokedBy, reason)
  }
}
