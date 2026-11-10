import { Injectable, Logger } from '@nestjs/common'
import { DiaryService, CreateDiaryInput } from './diary.service'

export interface DiarySyncEntry extends CreateDiaryInput {
  clientTempId: string
  seasonLotId: string
}

export interface DiarySyncResult {
  clientTempId: string
  status: 'created' | 'duplicate' | 'failed'
  serverId?: string
  error?: string
}

@Injectable()
export class DiarySyncService {
  private readonly logger = new Logger(DiarySyncService.name)

  constructor(private readonly diary: DiaryService) {}

  async syncBatch(entries: DiarySyncEntry[], farmerId: string) {
    const results: DiarySyncResult[] = []
    const duplicates: string[] = []
    let synced = 0
    let failed = 0

    // Preserve input order so one spray log cannot race a later entry in this batch.
    for (const entry of entries) {
      try {
        const { seasonLotId, ...payload } = entry
        const result = await this.diary.create(seasonLotId, farmerId, {
          ...payload,
          attachments: payload.attachments ?? [],
        })
        if ('isDuplicate' in result && result.isDuplicate) {
          duplicates.push(entry.clientTempId)
          results.push({ clientTempId: entry.clientTempId, serverId: result.id, status: 'duplicate' })
        } else {
          synced += 1
          results.push({ clientTempId: entry.clientTempId, serverId: result.id, status: 'created' })
        }
      } catch (error) {
        failed += 1
        const message = error instanceof Error ? error.message : 'Lỗi đồng bộ không xác định.'
        this.logger.warn(`Không đồng bộ được clientTempId=${entry.clientTempId}: ${message}`)
        results.push({ clientTempId: entry.clientTempId, status: 'failed', error: message })
      }
    }

    return { synced, failed, duplicates, results }
  }
}
