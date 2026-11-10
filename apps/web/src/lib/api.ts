import type {
  DiaryEntryInput,
  DiarySyncResult,
  DashboardStats,
  Id,
  OfflineDiaryEntry,
  QuarantineAlertRow,
  QuarantineInfo,
} from '../types'

const DEFAULT_API_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api/v1'
  : 'https://api.cropcoop.vn/v1'

export const BASE_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Lấy access token từ LocalStorage, nếu trình duyệt cho phép truy cập. */
const getToken = (): string | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem('accessToken')
  } catch {
    return null
  }
}

/** Fetch wrapper tự đính Authorization và chuẩn hóa lỗi API. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as {
      code?: string
      message?: string
      details?: unknown
    }
    throw new ApiError(error.message ?? `Yêu cầu thất bại (${response.status})`, response.status, error.code, error.details)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function serializeDiaryEntry(entry: DiaryEntryInput & { clientTempId?: string }, includeSeasonLotId: boolean) {
  const { seasonLotId, clientTempId, workDate, workType, description, weatherNote, laborCount, materials, attachments } = entry
  return {
    ...(clientTempId ? { clientTempId } : {}),
    workDate,
    workType,
    description,
    weatherNote,
    laborCount,
    attachments,
    ...(includeSeasonLotId ? { seasonLotId } : {}),
    materials: materials.map(({ materialId, quantityUsed, unit, applicationDate, note }) => ({
      materialId,
      quantityUsed,
      unit,
      applicationDate,
      note,
    })),
  }
}

export const diaryApi = {
  create: (seasonLotId: Id, data: DiaryEntryInput & { clientTempId?: string }) => {
    return apiFetch(`/season-lots/${encodeURIComponent(seasonLotId)}/diary`, {
      method: 'POST',
      body: JSON.stringify(serializeDiaryEntry(data, false)),
    })
  },

  sync: (entries: OfflineDiaryEntry[]) =>
    apiFetch<DiarySyncResult>('/diary/sync', {
      method: 'POST',
      body: JSON.stringify({
        entries: entries.map((entry) => serializeDiaryEntry(entry, true)),
      }),
    }),
}

export const quarantineApi = {
  getStatus: (seasonLotId: Id) =>
    apiFetch<QuarantineInfo>(`/season-lots/${encodeURIComponent(seasonLotId)}/quarantine`),

  getAlerts: () =>
    apiFetch<{ summary: Record<string, number>; alerts: QuarantineAlertRow[] }>('/quarantine/alerts'),
}

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>('/reports/season-progress'),
}

export const qrApi = {
  check: (seasonLotId: Id) =>
    apiFetch<unknown>(`/season-lots/${encodeURIComponent(seasonLotId)}/qr/check`, { method: 'POST' }),

  generate: (seasonLotId: Id, expiresAt?: string) =>
    apiFetch<unknown>(`/season-lots/${encodeURIComponent(seasonLotId)}/qr/generate`, {
      method: 'POST',
      body: JSON.stringify(expiresAt ? { expiresAt } : {}),
    }),

  approve: (qrId: Id) =>
    apiFetch<unknown>(`/qr/${encodeURIComponent(qrId)}/approve`, { method: 'POST' }),
}

/** Adapter giữ API mà EDiaryForm và useOfflineSync đang sử dụng. */
export const api = {
  createDiary(entry: DiaryEntryInput & { clientTempId?: string }) {
    return diaryApi.create(entry.seasonLotId, entry)
  },

  syncDiary(entries: OfflineDiaryEntry[]) {
    return diaryApi.sync(entries)
  },
}
