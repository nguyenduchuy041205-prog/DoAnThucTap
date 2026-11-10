import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma.service'
import { QuarantineService } from './quarantine.service'

@Injectable()
export class QuarantineScheduler {
  private readonly logger = new Logger(QuarantineScheduler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly quarantine: QuarantineService,
  ) {}

  @Cron('5 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async refreshStatuses(): Promise<void> {
    const seasonLots = await this.prisma.seasonLot.findMany({
      where: { season: { isActive: true } },
      select: { id: true },
    })
    let successCount = 0
    let errorCount = 0
    const batchSize = 10
    for (let index = 0; index < seasonLots.length; index += batchSize) {
      const batch = seasonLots.slice(index, index + batchSize)
      await Promise.all(batch.map(async ({ id }) => {
        try {
          await this.quarantine.recalculateAndSave(id)
          successCount += 1
        } catch (error) {
          errorCount += 1
          const stack = error instanceof Error ? error.stack : String(error)
          this.logger.error(`Không cập nhật được quarantine cho seasonLot ${id}`, stack)
        }
      }))
    }
    this.logger.log(`Đã cập nhật ${successCount}/${seasonLots.length} lô mùa vụ; lỗi: ${errorCount}.`)
  }
}
