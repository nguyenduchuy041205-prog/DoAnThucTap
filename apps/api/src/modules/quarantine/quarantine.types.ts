export type QuarantineStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'NOT_APPLIED'
export type ColorIndicator = 'GREEN' | 'YELLOW' | 'RED' | 'GREY'

export const WARNING_THRESHOLD_DAYS = 3

export interface PesticideEvent {
  applicationDate: Date
  materialId: string
  materialName: string
  activeIngredient: string | null
  quarantineDays: number
  quantityUsed: number
  unit: string
  diaryEntryId: string
}

export interface QuarantineCalculationResult {
  lastPesticideDate: Date | null
  requiredQuarantineDays: number
  safeDateToHarvest: Date | null
  quarantineStatus: QuarantineStatus
  colorIndicator: ColorIndicator
  daysRemaining: number | null
  daysOverSafe: number | null
  harvestAllowed: boolean
  warningMessage: string
  pesticideHistory: PesticideEvent[]
}

export interface DiaryConditionDetail {
  passed: boolean
  confirmedEntries: number
  totalEntries: number
  unconfirmedEntries: { id: string; workDate: Date; workType: string }[]
}

export interface QuarantineConditionDetail {
  passed: boolean
  status: QuarantineStatus
  safeDateToHarvest: Date | null
  daysOverSafe: number | null
  detail: string
}

export interface QualityConditionDetail {
  passed: boolean
  latestTest: {
    testType: string
    testLab: string | null
    testDate: Date
    isPassed: boolean
    certificationUrl: string | null
  } | null
  detail: string
}

export interface QRConditionResult {
  conditionDiaryOk: boolean
  conditionQuarantineOk: boolean
  conditionQualityOk: boolean
  canGenerateQR: boolean
  blockedBy: ('conditionDiaryOk' | 'conditionQuarantineOk' | 'conditionQualityOk')[]
  details: {
    diary: DiaryConditionDetail
    quarantine: QuarantineConditionDetail
    quality: QualityConditionDetail
  }
}
