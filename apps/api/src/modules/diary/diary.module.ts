import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma.module'
import { AuditModule } from '../audit/audit.module'
import { QuarantineModule } from '../quarantine/quarantine.module'
import { DiaryService } from './diary.service'
import { DiarySyncService } from './diary-sync.service'

@Module({
  imports: [PrismaModule, AuditModule, QuarantineModule],
  providers: [DiaryService, DiarySyncService],
  exports: [DiaryService, DiarySyncService],
})
export class DiaryModule {}
