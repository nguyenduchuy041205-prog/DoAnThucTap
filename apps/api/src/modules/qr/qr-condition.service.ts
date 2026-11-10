import { Injectable, NotFoundException } from '@nestjs/common'
import { DiaryStatus } from '@prisma/client'
import { PrismaService } from '../../common/prisma.service'
import { QuarantineService } from '../quarantine/quarantine.service'
import { QRConditionResult } from '../quarantine/quarantine.types'

const isNotExpired = (expiryDate: Date | null, asOf: Date): boolean => {
  if (!expiryDate) return true
  const toVietnamDate = (value: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(value)
  return toVietnamDate(expiryDate) >= toVietnamDate(asOf)
}

@Injectable()
export class QrConditionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quarantine: QuarantineService,
  ) {}

  async check(seasonLotId: string, asOf = new Date()): Promise<QRConditionResult> {
    const seasonLot = await this.prisma.seasonLot.findUnique({
      where: { id: seasonLotId },
      select: {
        id: true,
        diaryEntries: { select: { id: true, status: true, workDate: true, workType: true } },
        harvestRecord: {
          select: {
            qualityTests: {
              orderBy: [{ testDate: 'desc' }, { createdAt: 'desc' }],
              take: 1,
              select: { testType: true, labName: true, testDate: true, isPassed: true, certificationUrl: true, expiryDate: true },
            },
          },
        },
      },
    })
    if (!seasonLot) throw new NotFoundException('Không tìm thấy lô trong mùa vụ.')

    const diaryEntries = seasonLot.diaryEntries
    const confirmedEntries = diaryEntries.filter((entry) => entry.status === DiaryStatus.CONFIRMED || entry.status === DiaryStatus.LOCKED).length
    const unconfirmedEntries = diaryEntries
      .filter((entry) => entry.status !== DiaryStatus.CONFIRMED && entry.status !== DiaryStatus.LOCKED)
      .map(({ id, workDate, workType }) => ({ id, workDate, workType }))
    // An empty diary is not evidence that required production work was recorded.
    const conditionDiaryOk = diaryEntries.length > 0 && unconfirmedEntries.length === 0

    const quarantineResult = await this.quarantine.calculateForSeasonLot(seasonLotId, asOf)
    // NOT_APPLIED means there is no pesticide restriction to wait for.
    const conditionQuarantineOk = quarantineResult.harvestAllowed
    const quarantineDetail = quarantineResult.quarantineStatus === 'NOT_APPLIED'
      ? 'Chưa ghi nhận thuốc BVTV; không có thời gian cách ly.'
      : quarantineResult.quarantineStatus === 'SAFE'
        ? `An toàn; đã qua ngày ${quarantineResult.safeDateToHarvest?.toISOString().slice(0, 10)}.`
        : quarantineResult.warningMessage

    const latest = seasonLot.harvestRecord?.qualityTests[0] ?? null
    const conditionQualityOk = latest?.isPassed === true && isNotExpired(latest.expiryDate, asOf)

    const blockedBy: QRConditionResult['blockedBy'] = []
    if (!conditionDiaryOk) blockedBy.push('conditionDiaryOk')
    if (!conditionQuarantineOk) blockedBy.push('conditionQuarantineOk')
    if (!conditionQualityOk) blockedBy.push('conditionQualityOk')

    return {
      conditionDiaryOk,
      conditionQuarantineOk,
      conditionQualityOk,
      canGenerateQR: blockedBy.length === 0,
      blockedBy,
      details: {
        diary: {
          passed: conditionDiaryOk,
          confirmedEntries,
          totalEntries: diaryEntries.length,
          unconfirmedEntries,
        },
        quarantine: {
          passed: conditionQuarantineOk,
          status: quarantineResult.quarantineStatus,
          safeDateToHarvest: quarantineResult.safeDateToHarvest,
          daysOverSafe: quarantineResult.daysOverSafe,
          detail: quarantineDetail,
        },
        quality: {
          passed: conditionQualityOk,
          latestTest: latest ? {
            testType: latest.testType,
            testLab: latest.labName,
            testDate: latest.testDate,
            isPassed: latest.isPassed && isNotExpired(latest.expiryDate, asOf),
            certificationUrl: latest.certificationUrl,
          } : null,
          detail: latest
            ? !latest.isPassed ? 'Kiểm nghiệm mới nhất không đạt.'
              : !isNotExpired(latest.expiryDate, asOf) ? 'Chứng nhận kiểm nghiệm mới nhất đã hết hạn.'
                : 'Kiểm nghiệm mới nhất đạt yêu cầu.'
            : 'Chưa có kết quả kiểm nghiệm chất lượng.',
        },
      },
    }
  }
}
