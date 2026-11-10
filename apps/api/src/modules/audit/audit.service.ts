import { Injectable } from '@nestjs/common'
import { EntityType, Prisma } from '@prisma/client'
import { PrismaService } from '../../common/prisma.service'

export interface AuditLogInput {
  userId?: string
  action: string
  entityType: EntityType | `${EntityType}`
  entityId: string
  oldValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
  metadata?: Prisma.InputJsonValue
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(input: AuditLogInput): void {
    void this.prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues ?? Prisma.JsonNull,
        newValues: input.newValues ?? Prisma.JsonNull,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[AuditService] Could not persist audit log:', message)
    })
  }
}
