import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma.module'
import { AuditModule } from '../audit/audit.module'
import { QuarantineModule } from '../quarantine/quarantine.module'
import { QrConditionService } from './qr-condition.service'
import { QrService } from './qr.service'

@Module({
  imports: [PrismaModule, AuditModule, QuarantineModule],
  providers: [QrConditionService, QrService],
  exports: [QrConditionService, QrService],
})
export class QrModule {}
