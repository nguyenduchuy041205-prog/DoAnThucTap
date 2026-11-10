export type WorkType =
  | 'PLOWING'
  | 'SOWING'
  | 'FERTILIZING'
  | 'PESTICIDE'
  | 'IRRIGATION'
  | 'WEEDING'
  | 'HARVESTING'
  | 'OTHER'

export type DiaryStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'LOCKED'
export type QuarantineStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'NOT_APPLIED'
export type RoleCode = 'SUPER_ADMIN' | 'COOP_ADMIN' | 'TECHNICIAN' | 'ACCOUNTANT' | 'FARMER' | 'GUEST'
export type Id = string

export interface User {
  id: Id
  uid?: string
  fullName: string
  roles: RoleCode[]
  permissions: Record<string, string[]>
}

export interface SeasonLotSummary {
  id: Id
  lotCode: string
  lotName?: string
  cropType?: string
  seasonName?: string
  farmerName: string
  lastPesticideDate?: string | null
  quarantineStatus: QuarantineStatus
  daysRemaining: number | null
  safeDateToHarvest: string | null
  status?: string
}

export interface QuarantineInfo {
  seasonLotId: Id
  lotCode: string
  lastPesticideDate: string | null
  requiredQuarantineDays: number | null
  safeDateToHarvest: string | null
  today: string
  daysRemaining: number | null
  quarantineStatus: QuarantineStatus
  colorIndicator: 'RED' | 'YELLOW' | 'GREEN' | 'GREY' | 'GRAY'
  harvestAllowed: boolean
  warningMessage: string
}

export interface MaterialUsageInput {
  materialId: Id
  materialName?: string
  quantityUsed: number
  unit: string
  applicationDate: string
  note?: string
}

export interface AttachmentInput {
  fileUrl: string
  fileType: string
  caption?: string
}

export interface DiaryEntryInput {
  seasonLotId: Id
  workDate: string
  workType: WorkType
  description: string
  weatherNote?: string
  laborCount?: number
  materials: MaterialUsageInput[]
  attachments: AttachmentInput[]
}

export interface OfflineDiaryEntry extends DiaryEntryInput {
  clientTempId: string
  savedAt: string
  synced: boolean
  syncError?: string
}

export interface DashboardStats {
  activeSeason: { count: number; name: string }
  totalLots: number
  pendingDiaries: number
  quarantineAlerts: { DANGER: number; WARNING: number; SAFE: number }
  pendingQRRequests: number
  pendingOrders: number
  yieldThisSeason: number
}

export interface MaterialOption {
  id: Id
  name: string
  unit: string
  category: string
  quarantineDays?: number
}

export interface QuarantineAlertRow {
  seasonLotId: Id
  lotCode: string
  farmerName: string | null
  lastPesticideDate?: string | null
  quarantineStatus: QuarantineStatus
  daysRemaining: number | null
  safeDateToHarvest: string | null
}

export interface DiarySyncItemResult {
  clientTempId: string
  serverId?: Id | null
  status: 'created' | 'duplicate' | 'failed'
  code?: string | null
  message?: string | null
}

export interface DiarySyncResult {
  synced: number
  failed: number
  results: DiarySyncItemResult[]
  duplicates: string[]
}
