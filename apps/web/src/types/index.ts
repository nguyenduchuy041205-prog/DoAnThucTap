// =============================================================================
// CROP COOP / LIVESTOCK COOP — Type Definitions for 10 Core Modules
// HTX Chăn Nuôi & Truy Xuất Nguồn Gốc Số
// =============================================================================

export type ModuleType =
  | 'overview'
  | 'households'     // 1. Quản lý thành viên và hộ chăn nuôi
  | 'herds'          // 2. Quản lý đàn, nhóm vật nuôi và nguồn giống
  | 'growth'         // 3. Theo dõi chăm sóc và tăng trưởng (FCR)
  | 'inventory'      // 4. Quản lý thức ăn, thuốc thú y và vật tư
  | 'vaccination'    // 5. Lịch tiêm phòng, vệ sinh và khử trùng
  | 'health'         // 6. Theo dõi sức khỏe, dịch bệnh và điều trị
  | 'movements'      // 7. Quản lý nhập đàn, xuất đàn và tiêu thụ
  | 'traceability'   // 8. Truy xuất nguồn gốc vật nuôi / sản phẩm (QR)
  | 'orders'         // 9. Quản lý khách hàng, đơn hàng và hợp đồng
  | 'financials'     // 10. Tổng hợp chi phí, sản lượng và hiệu quả

export interface FarmerHousehold {
  id: string
  householdCode: string
  householderName: string
  phone: string
  address: string
  commune: string
  capacityHead: number
  currentHeadCount: number
  bioSecurityCert: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface HerdBatch {
  id: string
  batchCode: string
  householdName: string
  animalType: 'PIG' | 'CATTLE' | 'POULTRY' | 'GOAT'
  breedName: string
  currentQuantity: number
  initialQuantity: number
  entryDate: string
  avgCurrentWeightKg: number
  targetWeightKg: number
  status: 'RAISING' | 'WITHDRAWAL_WAIT' | 'READY_TO_SELL' | 'SOLD_OUT'
  safeHarvestDate?: string
  daysRemainingWithdrawal?: number
}

export interface GrowthRecord {
  id: string
  batchCode: string
  recordDate: string
  daysOfAge: number
  avgWeightKg: number
  dailyGainGram: number
  fcr: number
  recorder: string
}

export interface MaterialItem {
  id: string
  code: string
  name: string
  type: 'FEED' | 'VET_MEDICINE' | 'VACCINE' | 'DISINFECTANT'
  unit: string
  currentStock: number
  minStockAlert: number
  unitPrice: number
  withdrawalDays: number
  supplier: string
}

export interface VaccinationTask {
  id: string
  batchCode: string
  title: string
  scheduledDate: string
  executedDate?: string
  targetAgeDays: number
  dosage: string
  isCompleted: boolean
  assignedTo: string
}

export interface HealthCase {
  id: string
  batchCode: string
  reportedDate: string
  affectedCount: number
  condition: 'MONITORING' | 'SICK' | 'TREATED' | 'ISOLATED'
  symptoms: string
  diagnosis: string
  medicineUsed: string
  withdrawalDays: number
  safeDate: string
}

export interface HerdMovementItem {
  id: string
  batchCode: string
  type: 'IMPORT' | 'EXPORT_SALE' | 'TRANSFER_PEN' | 'CULLED_DEATH'
  date: string
  quantity: number
  totalWeightKg: number
  unitPriceKg: number
  totalValue: number
  partnerName: string
}

export interface TraceQrItem {
  id: string
  token: string
  batchCode: string
  productName: string
  householdName: string
  breedName: string
  entryDate: string
  harvestDate: string
  conditionVaccine: boolean
  conditionWithdrawal: boolean
  conditionVetChecked: boolean
  qrStatus: 'ACTIVE' | 'PENDING' | 'REVOKED'
  scanCount: number
  publicUrl: string
}

export interface ContractItem {
  id: string
  contractNo: string
  buyerName: string
  phone: string
  contractType: string
  committedQtyHead: number
  contractValue: number
  signedDate: string
  expiryDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export interface OrderItem {
  id: string
  orderNo: string
  customerName: string
  phone: string
  deliveryDate: string
  totalAmount: number
  status: 'CONFIRMED' | 'DELIVERED' | 'PROCESSING' | 'DRAFT'
}

export interface CostProfitSummary {
  batchCode: string
  householdName: string
  breedCost: number
  feedCost: number
  vetCost: number
  laborCost: number
  totalCost: number
  totalRevenue: number
  netProfit: number
  fcr: number
  survivalRate: number
  profitPerHead: number
}
