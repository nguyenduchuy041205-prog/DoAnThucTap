import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './common/prisma.module'
import { AuditModule } from './modules/audit/audit.module'
import { DiaryModule } from './modules/diary/diary.module'
import { QuarantineModule } from './modules/quarantine/quarantine.module'
import { QrModule } from './modules/qr/qr.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditModule,
    QuarantineModule,
    QrModule,
    DiaryModule,
  ],
})
export class AppModule {}
