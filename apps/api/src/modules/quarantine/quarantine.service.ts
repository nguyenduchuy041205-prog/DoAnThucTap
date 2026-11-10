import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../common/prisma.service'
import { AuditService } from '../audit/audit.service'
import {
  ColorIndicator,
  PesticideEvent,
  QuarantineCalculationResult,
  QuarantineStatus,
  WARNING_THRESHOLD_DAYS,
} from './quarantine.types'

const dateOnly = (date: Date): Date => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '0'
  return new Date(Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day'))))
}

const addDays = (date: Date, days: number): Date => {
  const result = dateOnly(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

const daysBetween = (from: Date, to: Date): number =>
  Math.round((dateOnly(to).getTime() - dateOnly(from).getTime()) / 86_400_000)

@Injectable()
export class QuarantineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /** Recompute from recorded pesticide material usage and persist the season-lot snapshot. */
  async calculateForSeasonLot(seasonLotId: string, asOf = new Date()): Promise<QuarantineCalculationResult> {
    const seasonLot = await this.prisma.seasonLot.findUnique({ where: { id: seasonLotId }, select: { id: true } })
    if (!seasonLot) throw new NotFoundException('Không tìm thấy lô trong mùa vụ.')

    const usages = await this.prisma.materialUsage.findMany({
      where: { seasonLotId, material: { category: { equals: 'PESTICIDE', mode: 'insensitive' } } },
      include: {
        material: { select: { id: true, name: true, activeIngredient: true, quarantineDays: true } },
        diaryEntry: { select: { id: true } },
      },
      orderBy: [{ applicationDate: 'desc' }, { createdAt: 'desc' }],
    })

    const history: PesticideEvent[] = usages.map((usage) => ({
      applicationDate: dateOnly(usage.applicationDate),
      materialId: usage.material.id,
      materialName: usage.material.name,
      activeIngredient: usage.material.activeIngredient,
      quarantineDays: usage.material.quarantineDays,
      quantityUsed: Number(usage.quantity),
      unit: usage.unit,
      diaryEntryId: usage.diaryEntry.id,
    }))

    const lastPesticideDate = history[0]?.applicationDate ?? null
    // Store the longest restriction recorded in this season; the contract defines the
    // safe date as last application plus the required quarantine duration.
    const requiredQuarantineDays = history.reduce((max, event) => Math.max(max, event.quarantineDays), 0)
    const safeDateToHarvest = lastPesticideDate ? addDays(lastPesticideDate, requiredQuarantineDays) : null
    const today = dateOnly(asOf)
    const remaining = safeDateToHarvest ? daysBetween(today, safeDateToHarvest) : null

    let quarantineStatus: QuarantineStatus
    let colorIndicator: ColorIndicator
    let daysRemaining: number | null = null
    let daysOverSafe: number | null = null
    let harvestAllowed: boolean
    let warningMessage: string

    if (!safeDateToHarvest) {
      quarantineStatus = 'NOT_APPLIED'
      colorIndicator = 'GREY'
      harvestAllowed = true
      warningMessage = 'Chưa ghi nhận sử dụng thuốc BVTV trong mùa vụ.'
    } else if (remaining! > 0) {
      daysRemaining = remaining
      quarantineStatus = remaining! <= WARNING_THRESHOLD_DAYS ? 'WARNING' : 'DANGER'
      colorIndicator = quarantineStatus === 'WARNING' ? 'YELLOW' : 'RED'
      harvestAllowed = false
      warningMessage = `Chưa được thu hoạch. Còn ${remaining} ngày cách ly, đến ${safeDateToHarvest.toISOString().slice(0, 10)}.`
    } else {
      quarantineStatus = 'SAFE'
      colorIndicator = 'GREEN'
      daysOverSafe = Math.abs(remaining!)
      harvestAllowed = true
      warningMessage = 'Đã hết thời gian cách ly; có thể thu hoạch.'
    }

    return {
      lastPesticideDate,
      requiredQuarantineDays,
      safeDateToHarvest,
      quarantineStatus,
      colorIndicator,
      daysRemaining,
      daysOverSafe,
      harvestAllowed,
      warningMessage,
      pesticideHistory: history,
    }
  }

  /** Recalculate and persist the derived fields, auditing status transitions. */
  async recalculateAndSave(
    seasonLotId: string,
    triggeredByUserId?: string,
    asOf = new Date(),
  ): Promise<QuarantineCalculationResult> {
    const seasonLot = await this.prisma.seasonLot.findUnique({
      where: { id: seasonLotId },
      select: { id: true, quarantineStatus: true },
    })
    if (!seasonLot) throw new NotFoundException('Không tìm thấy lô trong mùa vụ.')

    const result = await this.calculateForSeasonLot(seasonLotId, asOf)
    await this.prisma.seasonLot.update({
      where: { id: seasonLotId },
      data: {
        lastPesticideDate: result.lastPesticideDate,
        requiredQuarantineDays: result.requiredQuarantineDays,
        safeDateToHarvest: result.safeDateToHarvest,
        quarantineStatus: result.quarantineStatus,
        quarantineUpdatedAt: new Date(),
      },
    })

    if (seasonLot.quarantineStatus !== result.quarantineStatus) {
      await this.auditService.log({
        userId: triggeredByUserId,
        action: 'QUARANTINE_STATUS_CHANGED',
        entityType: 'SEASON_LOT',
        entityId: seasonLotId,
        oldValues: { quarantineStatus: seasonLot.quarantineStatus },
        newValues: {
          quarantineStatus: result.quarantineStatus,
          lastPesticideDate: result.lastPesticideDate?.toISOString() ?? null,
          safeDateToHarvest: result.safeDateToHarvest?.toISOString() ?? null,
        },
      })
    }

    return result
  }

  /** Compatibility helper for manual recalc and the daily scheduler. */
  async recalculate(seasonLotId: string, asOf = new Date()): Promise<QuarantineCalculationResult> {
    return this.recalculateAndSave(seasonLotId, undefined, asOf)
  }

  /** Read a fresh value for QR checks without relying on the cached status. */
  async getStatus(seasonLotId: string, asOf = new Date()): Promise<QuarantineCalculationResult> {
    return this.calculateForSeasonLot(seasonLotId, asOf)
  }

  async getStatusForSeasonLot(seasonLotId: string, asOf = new Date()) {
    const seasonLot = await this.prisma.seasonLot.findUnique({
      where: { id: seasonLotId },
      include: {
        lot: { select: { lotCode: true } },
        season: { select: { cropType: true } },
      },
    })
    if (!seasonLot) throw new NotFoundException('Không tìm thấy lô trong mùa vụ.')
    const result = await this.calculateForSeasonLot(seasonLotId, asOf)
    return {
      seasonLotId,
      lotCode: seasonLot.lot.lotCode,
      cropType: seasonLot.season.cropType,
      today: dateOnly(asOf).toISOString().slice(0, 10),
      ...result,
    }
  }

  async getAlertsDashboard(seasonId?: string, asOf = new Date()) {
    const seasonLots = await this.prisma.seasonLot.findMany({
      where: {
        season: { isActive: true, ...(seasonId ? { id: seasonId } : {}) },
      },
      select: {
        id: true,
        farmerId: true,
        lot: { select: { lotCode: true } },
      },
    })
    const farmers = await this.prisma.user.findMany({
      where: { id: { in: seasonLots.flatMap((seasonLot) => seasonLot.farmerId ? [seasonLot.farmerId] : []) } },
      select: { id: true, fullName: true },
    })
    const farmerNames = new Map(farmers.map((farmer) => [farmer.id, farmer.fullName]))
    const priorities: Record<QuarantineStatus, number> = { DANGER: 0, WARNING: 1, SAFE: 2, NOT_APPLIED: 3 }
    const alerts = await Promise.all(seasonLots.map(async (seasonLot) => {
      const result = await this.calculateForSeasonLot(seasonLot.id, asOf)
      return {
        seasonLotId: seasonLot.id,
        lotCode: seasonLot.lot.lotCode,
        farmerName: seasonLot.farmerId ? farmerNames.get(seasonLot.farmerId) ?? null : null,
        quarantineStatus: result.quarantineStatus,
        daysRemaining: result.daysRemaining,
        safeDateToHarvest: result.safeDateToHarvest,
        colorIndicator: result.colorIndicator,
      }
    }))
    alerts.sort((a, b) => priorities[a.quarantineStatus] - priorities[b.quarantineStatus])
    const summary: Record<QuarantineStatus, number> = { DANGER: 0, WARNING: 0, SAFE: 0, NOT_APPLIED: 0 }
    for (const alert of alerts) summary[alert.quarantineStatus] += 1
    return { summary: { total: alerts.length, ...summary }, alerts }
  }
}

// Keep Prisma's generated payload typing available to service consumers when they
// need a transaction client for future atomic workflows.
export type QuarantineTransaction = Prisma.TransactionClient
