import type { QuarantineStatus, WorkType } from '../types'

/** Tạo UUID v4 dùng làm clientTempId khi nhập offline. */
export const generateClientTempId = (): string => createId()

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  PLOWING: '🚜 Làm đất / Cày bừa',
  SOWING: '🌱 Gieo hạt / Cấy',
  FERTILIZING: '🧪 Bón phân',
  PESTICIDE: '💊 Phun thuốc BVTV',
  IRRIGATION: '💧 Tưới nước',
  WEEDING: '🌿 Làm cỏ',
  HARVESTING: '🌾 Thu hoạch',
  OTHER: '📝 Khác',
}

export const QUARANTINE_CONFIG: Record<QuarantineStatus, {
  label: string
  bgColor: string
  textColor: string
  borderColor: string
  icon: string
}> = {
  DANGER: { label: 'CẤM THU HOẠCH', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-500', icon: '🔴' },
  WARNING: { label: 'SẮP HẾT CÁCH LY', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-500', icon: '🟡' },
  SAFE: { label: 'AN TOÀN', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-500', icon: '🟢' },
  NOT_APPLIED: { label: 'CHƯA PHUN THUỐC', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-300', icon: '⚪' },
}

/** Alias giữ tương thích với các component hiện tại. */
export const workTypeLabels = WORK_TYPE_LABELS
export const quarantineLabels: Record<QuarantineStatus, string> = {
  DANGER: QUARANTINE_CONFIG.DANGER.label,
  WARNING: QUARANTINE_CONFIG.WARNING.label,
  SAFE: QUARANTINE_CONFIG.SAFE.label,
  NOT_APPLIED: QUARANTINE_CONFIG.NOT_APPLIED.label,
}

/** Format ngày Việt Nam, tránh đổi ngày do parse YYYY-MM-DD như UTC. */
export const formatDateVN = (value: string | null): string => {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export const formatDate = (value: string | null | undefined) => formatDateVN(value ?? null)

/** Cộng số ngày lịch vào chuỗi YYYY-MM-DD mà không dịch ngày theo UTC. */
export const addDaysToDate = (dateValue: string, days: number): string => {
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number)
  const date = new Date(year, month - 1, day + days)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const formatNumber = (value: number): string => value.toLocaleString('vi-VN')

export function createId(): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID()
  if (cryptoApi) {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return [...bytes].map((byte, index) => `${[4, 6, 8, 10].includes(index) ? '-' : ''}${byte.toString(16).padStart(2, '0')}`).join('')
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0
    return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'
}
