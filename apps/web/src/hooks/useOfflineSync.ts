import { useCallback, useEffect, useRef, useState } from 'react'
import { diaryApi } from '../lib/api'
import {
  clearSyncedEntries,
  getOfflineEntries,
  getPendingSyncCount,
  markAsSynced,
  markSyncError,
} from '../store/diaryOfflineStore'
import { useOnlineStatus } from './useOnlineStatus'

export interface SyncState {
  isSyncing: boolean
  pendingCount: number
  lastSyncAt: Date | null
  syncError: string | null
}

export const useOfflineSync = () => {
  const isOnline = useOnlineStatus()
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isSyncing: false,
    pendingCount: getPendingSyncCount(),
    lastSyncAt: null,
    syncError: null,
  }))
  const running = useRef(false)

  /** Gửi pending entries theo batch tối đa 100 bản ghi. */
  const syncNow = useCallback(async (): Promise<void> => {
    if (!isOnline || running.current) return
    const pending = getOfflineEntries().filter((entry) => !entry.synced)
    if (pending.length === 0) {
      setSyncState((state) => ({ ...state, pendingCount: 0 }))
      return
    }

    running.current = true
    setSyncState((state) => ({ ...state, isSyncing: true, syncError: null }))
    let syncError: string | null = null
    let madeRequest = false

    try {
      for (let offset = 0; offset < pending.length; offset += 100) {
        const batch = pending.slice(offset, offset + 100)
        try {
          const result = await diaryApi.sync(batch)
          madeRequest = true
          const successfulIds = new Set(
            result.results
              .filter((item) => item.status === 'created' || item.status === 'duplicate')
              .map((item) => item.clientTempId)
              .concat(result.duplicates ?? []),
          )
          const resultById = new Map(result.results.map((item) => [item.clientTempId, item] as const))

          for (const entry of batch) {
            if (successfulIds.has(entry.clientTempId)) {
              markAsSynced(entry.clientTempId)
            } else {
              const item = resultById.get(entry.clientTempId)
              const message = item?.message ?? item?.code ?? 'Máy chủ chưa xác nhận bản ghi này.'
              markSyncError(entry.clientTempId, message)
              syncError ??= message
            }
          }
          clearSyncedEntries()
        } catch (error) {
          syncError = error instanceof Error ? error.message : 'Lỗi kết nối máy chủ'
          batch.forEach((entry) => markSyncError(entry.clientTempId, syncError!))
          break
        }
      }

      setSyncState((state) => ({
        ...state,
        isSyncing: false,
        pendingCount: getPendingSyncCount(),
        lastSyncAt: madeRequest ? new Date() : state.lastSyncAt,
        syncError,
      }))
    } finally {
      running.current = false
      setSyncState((state) => state.isSyncing ? { ...state, isSyncing: false } : state)
    }
  }, [isOnline])

  /** Tự đồng bộ khi ứng dụng mở lại hoặc mạng vừa hồi phục. */
  useEffect(() => {
    if (isOnline && getPendingSyncCount() > 0) void syncNow()
  }, [isOnline, syncNow])

  /** Gọi sau khi thêm bản ghi cục bộ; cũng kích hoạt sync nếu đang online. */
  const refreshPendingCount = useCallback(() => {
    const pendingCount = getPendingSyncCount()
    setSyncState((state) => ({ ...state, pendingCount }))
    if (isOnline && pendingCount > 0) void syncNow()
  }, [isOnline, syncNow])

  const lastSyncMessage = syncState.syncError
    ?? (syncState.lastSyncAt ? `Đồng bộ gần nhất lúc ${syncState.lastSyncAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : '')

  return {
    isOnline,
    syncState,
    syncNow,
    refreshPendingCount,
    // Compatibility aliases used by the current App shell.
    isSyncing: syncState.isSyncing,
    pendingCount: syncState.pendingCount,
    lastSyncMessage,
    refreshCount: refreshPendingCount,
  }
}
