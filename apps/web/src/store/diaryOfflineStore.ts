import type { DiaryEntryInput, OfflineDiaryEntry } from '../types'
import { generateClientTempId } from '../lib/utils'

const STORAGE_KEY = 'cropcoop_offline_diaries'
const LEGACY_STORAGE_KEY = 'cropcoop:offline-diary:v1'
const MAX_QUEUE_SIZE = 100
const MAX_STORAGE_BYTES = 4 * 1024 * 1024

const readKey = (key: string): OfflineDiaryEntry[] => {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as OfflineDiaryEntry[] : []
  } catch {
    return []
  }
}

/** Lấy toàn bộ bản ghi lưu cục bộ (cả đã sync và đang chờ). */
export const getOfflineEntries = (): OfflineDiaryEntry[] => {
  const current = readKey(STORAGE_KEY)
  if (current.length) return current

  // Chuyển queue từ phiên bản store trước nếu người dùng đã nhập offline.
  const legacy = readKey(LEGACY_STORAGE_KEY)
  if (legacy.length) {
    try {
      writeEntries(legacy)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Vẫn trả dữ liệu legacy để không làm mất khả năng đồng bộ trong phiên này.
    }
    return legacy
  }
  return current
}

const writeEntries = (entries: OfflineDiaryEntry[]): void => {
  if (typeof localStorage === 'undefined') throw new Error('LocalStorage không khả dụng trên thiết bị này.')
  const serialized = JSON.stringify(entries)
  if (serialized.length * 2 > MAX_STORAGE_BYTES) {
    throw new Error('Hàng đợi offline vượt quá dung lượng an toàn. Hãy đồng bộ hoặc giảm kích thước ảnh.')
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    throw new Error('Bộ nhớ offline đã đầy. Hãy bỏ bớt ảnh hoặc đồng bộ các bản ghi đang chờ.')
  }
}

const enqueueEntry = (data: DiaryEntryInput, clientTempId: string): OfflineDiaryEntry => {
  const existing = getOfflineEntries()
  const duplicate = existing.find((entry) => entry.clientTempId === clientTempId)
  if (duplicate) return duplicate

  if (existing.filter((entry) => !entry.synced).length >= MAX_QUEUE_SIZE) {
    throw new Error(`Hàng đợi offline đã đạt ${MAX_QUEUE_SIZE} bản ghi. Hãy đồng bộ trước khi nhập thêm.`)
  }

  const entry: OfflineDiaryEntry = {
    ...data,
    clientTempId,
    savedAt: new Date().toISOString(),
    synced: false,
  }
  writeEntries([entry, ...existing])
  return entry
}

/** Lưu 1 entry mới vào LocalStorage khi offline hoặc cần giữ bản nháp. */
export const saveOfflineEntry = (data: DiaryEntryInput, clientTempId = generateClientTempId()): OfflineDiaryEntry =>
  enqueueEntry(data, clientTempId)

/** Đánh dấu đã sync thành công cho một clientTempId. */
export const markAsSynced = (clientTempId: string): void => {
  updateEntries((entries) => entries.map((entry) => entry.clientTempId === clientTempId
    ? { ...entry, synced: true, syncError: undefined }
    : entry))
}

/** Lưu lỗi trả về khi đồng bộ một bản ghi. */
export const markSyncError = (clientTempId: string, error: string): void => {
  updateEntries((entries) => entries.map((entry) => entry.clientTempId === clientTempId
    ? { ...entry, syncError: error }
    : entry))
}

/** Xóa các bản ghi đã đồng bộ thành công khỏi LocalStorage. */
export const clearSyncedEntries = (): void => {
  updateEntries((entries) => entries.filter((entry) => !entry.synced))
}

/** Đếm số bản ghi chưa đồng bộ. */
export const getPendingSyncCount = (): number =>
  getOfflineEntries().filter((entry) => !entry.synced).length

const updateEntries = (updater: (entries: OfflineDiaryEntry[]) => OfflineDiaryEntry[]): void => {
  writeEntries(updater(getOfflineEntries()))
}

/** Adapter giữ API dùng bởi form và hook hiện tại. */
export const diaryOfflineStore = {
  all: getOfflineEntries,
  pending: () => getOfflineEntries().filter((entry) => !entry.synced),
  save: (input: DiaryEntryInput, clientTempId = generateClientTempId()) => enqueueEntry(input, clientTempId),
  markSynced(clientTempIds: string[]) {
    const ids = new Set(clientTempIds)
    updateEntries((entries) => entries.map((entry) => ids.has(entry.clientTempId)
      ? { ...entry, synced: true, syncError: undefined }
      : entry))
  },
  clearSynced: clearSyncedEntries,
  setErrors(errors: Map<string, string>) {
    updateEntries((entries) => entries.map((entry) => errors.has(entry.clientTempId)
      ? { ...entry, syncError: errors.get(entry.clientTempId) }
      : entry))
  },
}
