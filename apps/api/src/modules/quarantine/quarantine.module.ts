import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma.module'
import { AuditModule } from '../audit/audit.module'
import { QuarantineScheduler } from './quarantine.scheduler'
import { QuarantineService } from './quarantine.service'

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [QuarantineService, QuarantineScheduler],
  exports: [QuarantineService],
})
export class QuarantineModule {}
