import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DiaryStatus, Prisma, WorkType } from '@prisma/client'
import { PrismaService } from '../../common/prisma.service'
import { AuditService } from '../audit/audit.service'
import { QuarantineService } from '../quarantine/quarantine.service'

export interface CreateDiaryInput {
  workDate: string
  workType: WorkType
  description: string
  weatherNote?: string
  laborCount?: number
  clientTempId?: string
  materials: {
    materialId: string
    quantityUsed: number
    unit: string
    applicationDate: string
    note?: string
  }[]
  attachments?: {
    fileUrl: string
    fileType?: string
    caption?: string
  }[]
}

const parseDateOnly = (value: string, field: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException(`${field} phải có định dạng YYYY-MM-DD.`)
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} không phải ngày hợp lệ.`)
  }
  return parsed
}

@Injectable()
export class DiaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quarantine: QuarantineService,
    private readonly audit: AuditService,
  ) {}

  async create(seasonLotId: string, authorId: string, input: CreateDiaryInput) {
    await this.assertFarmerOwnsSeasonLot(seasonLotId, authorId)
    if (input.clientTempId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.clientTempId)) {
      throw new BadRequestException('clientTempId phải là UUID hợp lệ.')
    }

    if (input.clientTempId) {
      const existing = await this.prisma.diaryEntry.findUnique({
        where: { clientTempId: input.clientTempId },
        select: { id: true, status: true, authorId: true, seasonLotId: true },
      })
      if (existing) {
        if (existing.authorId !== authorId) throw new ConflictException('clientTempId đã được sử dụng bởi tài khoản khác.')
        if (existing.seasonLotId !== seasonLotId) throw new ConflictException('clientTempId đã được dùng cho lô mùa vụ khác.')
        return { id: existing.id, status: existing.status, isDuplicate: true }
      }
    }

    const workDate = parseDateOnly(input.workDate, 'workDate')
    if (!input.description.trim()) throw new BadRequestException('description không được để trống.')
    if (input.laborCount !== undefined && (!Number.isInteger(input.laborCount) || input.laborCount < 1)) {
      throw new BadRequestException('laborCount phải là số nguyên dương.')
    }
    const materials = input.materials ?? []
    const attachments = input.attachments ?? []
    for (const material of materials) {
      if (!Number.isFinite(material.quantityUsed) || material.quantityUsed <= 0) {
        throw new BadRequestException('quantityUsed phải lớn hơn 0.')
      }
      parseDateOnly(material.applicationDate, 'applicationDate')
    }

    const materialIds = [...new Set(materials.map((material) => material.materialId))]
    const availableMaterials = materialIds.length
      ? await this.prisma.material.findMany({
          where: { id: { in: materialIds }, isActive: true },
          select: { id: true },
        })
      : []
    if (availableMaterials.length !== materialIds.length) {
      throw new BadRequestException('Một hoặc nhiều vật tư không tồn tại hoặc đã ngừng sử dụng.')
    }

    let entry
    try {
      entry = await this.prisma.$transaction(async (tx) => tx.diaryEntry.create({
        data: {
          seasonLotId,
          authorId,
          workDate,
          workType: input.workType,
          description: input.description.trim(),
          weatherNote: input.weatherNote,
          laborCount: input.laborCount,
          clientTempId: input.clientTempId,
          syncedAt: new Date(),
          status: DiaryStatus.DRAFT,
          materialUsages: {
            create: materials.map((material) => ({
              seasonLotId,
              materialId: material.materialId,
              quantity: new Prisma.Decimal(material.quantityUsed),
              unit: material.unit,
              applicationDate: parseDateOnly(material.applicationDate, 'applicationDate'),
              notes: material.note,
            })),
          },
          attachments: {
            create: attachments.map((attachment, index) => ({
              fileUrl: attachment.fileUrl,
              fileType: attachment.fileType,
              caption: attachment.caption,
              sortOrder: index,
            })),
          },
        },
        select: { id: true, status: true, workDate: true, workType: true, syncedAt: true },
      }))
    } catch (error) {
      if (input.clientTempId && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const duplicate = await this.prisma.diaryEntry.findUnique({ where: { clientTempId: input.clientTempId } })
        if (duplicate?.authorId === authorId && duplicate.seasonLotId === seasonLotId) {
          return { id: duplicate.id, status: duplicate.status, isDuplicate: true }
        }
      }
      throw error
    }

    this.audit.log({
      userId: authorId,
      action: 'DIARY_CREATED',
      entityType: 'DIARY_ENTRY',
      entityId: entry.id,
      newValues: { seasonLotId, workType: entry.workType, workDate: input.workDate },
    })

    const pesticideMaterialIds = materials.map((material) => material.materialId)
    const hasPesticide = pesticideMaterialIds.length > 0 && (await this.prisma.material.count({
      where: { id: { in: pesticideMaterialIds }, category: { equals: 'PESTICIDE', mode: 'insensitive' } },
    })) > 0
    const quarantineUpdate = hasPesticide
      ? await this.quarantine.recalculateAndSave(seasonLotId, authorId)
      : undefined

    return {
      id: entry.id,
      seasonLotId,
      workDate: input.workDate,
      workType: entry.workType,
      status: entry.status,
      syncedAt: entry.syncedAt,
      ...(quarantineUpdate ? { quarantineUpdate } : {}),
    }
  }

  async submit(seasonLotId: string, diaryId: string, authorId: string) {
    const entry = await this.findEntry(seasonLotId, diaryId)
    if (entry.authorId !== authorId) throw new ForbiddenException('Bạn chỉ có thể nộp nhật ký của mình.')
    if (entry.status !== DiaryStatus.DRAFT && entry.status !== DiaryStatus.REJECTED) {
      throw new ConflictException('Chỉ nhật ký nháp hoặc bị từ chối mới có thể nộp.')
    }
    const updated = await this.prisma.diaryEntry.update({
      where: { id: diaryId },
      data: { status: DiaryStatus.SUBMITTED, submittedAt: new Date(), rejectReason: null },
      select: { id: true, status: true, submittedAt: true },
    })
    this.audit.log({ userId: authorId, action: 'DIARY_SUBMITTED', entityType: 'DIARY_ENTRY', entityId: diaryId })
    return updated
  }

  async confirm(seasonLotId: string, diaryId: string, confirmerId: string, note?: string) {
    const entry = await this.findEntry(seasonLotId, diaryId)
    if (entry.status !== DiaryStatus.SUBMITTED) {
      throw new ConflictException(`Chỉ nhật ký đã nộp mới có thể xác nhận. Trạng thái hiện tại: ${entry.status}.`)
    }
    const now = new Date()
    const updated = await this.prisma.diaryEntry.updateMany({
      where: { id: diaryId, seasonLotId, status: DiaryStatus.SUBMITTED },
      data: { status: DiaryStatus.CONFIRMED, confirmerId, confirmedAt: now },
    })
    if (updated.count !== 1) throw new ConflictException('Nhật ký đã được xử lý đồng thời.')

    const confirmed = await this.prisma.diaryEntry.findUniqueOrThrow({
      where: { id: diaryId },
      select: { id: true, seasonLotId: true, status: true, workType: true, confirmedAt: true },
    })
    if (confirmed.workType === WorkType.PESTICIDE) {
      await this.quarantine.recalculateAndSave(seasonLotId, confirmerId)
    }
    this.audit.log({
      userId: confirmerId,
      action: 'DIARY_CONFIRMED',
      entityType: 'DIARY_ENTRY',
      entityId: diaryId,
      oldValues: { status: DiaryStatus.SUBMITTED },
      newValues: { status: DiaryStatus.CONFIRMED, note },
    })
    return { id: confirmed.id, status: confirmed.status, confirmedAt: confirmed.confirmedAt }
  }

  async reject(seasonLotId: string, diaryId: string, reviewerId: string, reason: string) {
    if (!reason.trim()) throw new BadRequestException('reason là bắt buộc khi từ chối nhật ký.')
    const entry = await this.findEntry(seasonLotId, diaryId)
    if (entry.status !== DiaryStatus.SUBMITTED) throw new ConflictException('Chỉ nhật ký đã nộp mới có thể từ chối.')
    const updated = await this.prisma.diaryEntry.updateMany({
      where: { id: diaryId, seasonLotId, status: DiaryStatus.SUBMITTED },
      data: { status: DiaryStatus.REJECTED, rejectReason: reason.trim() },
    })
    if (updated.count !== 1) throw new ConflictException('Nhật ký đã được xử lý đồng thời.')
    this.audit.log({
      userId: reviewerId,
      action: 'DIARY_REJECTED',
      entityType: 'DIARY_ENTRY',
      entityId: diaryId,
      oldValues: { status: DiaryStatus.SUBMITTED },
      newValues: { status: DiaryStatus.REJECTED, reason: reason.trim() },
    })
    return { id: diaryId, status: DiaryStatus.REJECTED, rejectReason: reason.trim() }
  }

  private async assertFarmerOwnsSeasonLot(seasonLotId: string, farmerId: string): Promise<void> {
    const seasonLot = await this.prisma.seasonLot.findFirst({
      where: { id: seasonLotId, farmerId },
      select: { id: true },
    })
    if (!seasonLot) throw new ForbiddenException('Bạn không được phân công vào lô mùa vụ này.')
  }

  private async findEntry(seasonLotId: string, diaryId: string) {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id: diaryId, seasonLotId },
      select: { id: true, seasonLotId: true, authorId: true, status: true, workType: true },
    })
    if (!entry) throw new NotFoundException('Không tìm thấy nhật ký trong lô mùa vụ này.')
    return entry
  }
}
