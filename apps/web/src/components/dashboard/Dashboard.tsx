import { useEffect, useState } from 'react'
import { AlertTriangle, ClipboardList } from 'lucide-react'
import type { DashboardStats, QuarantineAlertRow, SeasonLotSummary } from '../../types'
import type { SyncState } from '../../hooks/useOfflineSync'
import { dashboardApi, quarantineApi } from '../../lib/api'
import { formatNumber } from '../../lib/utils'
import { QuarantineAlertTable } from './QuarantineAlertTable'
import { SeasonProgressBar } from './SeasonProgressBar'
import { StatsCard } from './StatsCard'

interface Props {
  onCreateDiary: () => void
  isOnline: boolean
  syncState: SyncState
  syncNow: () => Promise<void>
}

export function Dashboard({ onCreateDiary, isOnline, syncState, syncNow }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<QuarantineAlertRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!isOnline) {
      setIsLoading(false)
      return () => { cancelled = true }
    }

    setIsLoading(true)
    void Promise.allSettled([dashboardApi.getStats(), quarantineApi.getAlerts()]).then(([statsResult, alertsResult]) => {
      if (cancelled) return
      const errors: string[] = []
      if (statsResult.status === 'fulfilled') setStats(statsResult.value)
      else errors.push(statsResult.reason instanceof Error ? statsResult.reason.message : 'Không tải được thống kê.')

      if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value.alerts)
      else errors.push(alertsResult.reason instanceof Error ? alertsResult.reason.message : 'Không tải được cảnh báo cách ly.')

      setLoadError(errors.join(' '))
      if (errors.length < 2) setRefreshedAt(new Date())
    }).finally(() => {
      if (!cancelled) setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [isOnline])

  const dangerCount = stats?.quarantineAlerts.DANGER ?? alerts.filter((lot) => lot.quarantineStatus === 'DANGER').length
  const warningCount = stats?.quarantineAlerts.WARNING ?? alerts.filter((lot) => lot.quarantineStatus === 'WARNING').length
  const safeCount = stats?.quarantineAlerts.SAFE ?? alerts.filter((lot) => lot.quarantineStatus === 'SAFE').length
  const totalLots = stats?.totalLots ?? alerts.length
  const tableLots: SeasonLotSummary[] = alerts.map((lot) => ({
    id: lot.seasonLotId,
    lotCode: lot.lotCode,
    farmerName: lot.farmerName ?? '—',
    lastPesticideDate: lot.lastPesticideDate ?? null,
    quarantineStatus: lot.quarantineStatus,
    daysRemaining: lot.daysRemaining,
    safeDateToHarvest: lot.safeDateToHarvest,
  }))

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()).toLocaleUpperCase('vi-VN')}</div>
          <h1>Tổng quan hệ thống <span className="wave">✳</span></h1>
          <p className="page-subtitle">
            {refreshedAt ? `Cập nhật lúc ${refreshedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Tình hình hoạt động của hợp tác xã.'}
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onCreateDiary}>
          <ClipboardList size={17} /> Tạo nhật ký mới
        </button>
      </div>

      {!isOnline && (
        <div className="offline-banner"><span>📡</span><div><strong>Đang hoạt động ngoại tuyến</strong><p>Dữ liệu nhật ký lưu trên thiết bị và sẽ đồng bộ khi có mạng.{syncState.pendingCount > 0 && ` Có ${syncState.pendingCount} bản ghi đang chờ.`}</p></div></div>
      )}
      {loadError && <div className="dashboard-error"><AlertTriangle size={16} /><span>{loadError}{stats || alerts.length ? ' Các số liệu đã tải được vẫn đang hiển thị.' : ''}</span></div>}
      {syncState.syncError && <div className="dashboard-error"><AlertTriangle size={16} /><span>Đồng bộ thất bại: {syncState.syncError}. Nhật ký vẫn được giữ trên thiết bị.</span></div>}

      <div className="stats-grid stats-grid-expanded">
        <StatsCard title="Mùa vụ đang hoạt động" value={isLoading ? '…' : stats?.activeSeason.count ?? '—'} subtitle={stats?.activeSeason.name} icon="📅" colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <StatsCard title="Tổng số lô canh tác" value={isLoading ? '…' : stats?.totalLots ?? '—'} subtitle="Trong các vùng trồng" icon="🗺️" colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatsCard title="Nhật ký chờ xác nhận" value={isLoading ? '…' : stats?.pendingDiaries ?? '—'} subtitle="Cán bộ kỹ thuật cần xem" icon="📓" colorClass="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatsCard title="Cảnh báo cách ly" value={isLoading ? '…' : dangerCount + warningCount} subtitle={`${dangerCount} đỏ · ${warningCount} vàng`} icon="⚠️" colorClass={dangerCount > 0 ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-yellow-500 to-yellow-700'} />
        <StatsCard title="QR chờ duyệt" value={isLoading ? '…' : stats?.pendingQRRequests ?? '—'} icon="📱" colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
        <StatsCard title="Đơn hàng mới" value={isLoading ? '…' : stats?.pendingOrders ?? '—'} subtitle="Từ Public Portal" icon="🛒" colorClass="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatsCard title="Sản lượng mùa vụ" value={stats ? `${formatNumber(Math.round(stats.yieldThisSeason / 1000))} tấn` : isLoading ? '…' : '—'} icon="🌾" colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
      </div>

      <div className="dashboard-grid lower-grid live-dashboard-grid">
        <QuarantineAlertTable lots={tableLots} isLoading={isLoading} />
        <section className="panel live-progress-panel">
          <div className="panel-heading"><div><div className="eyebrow">MÙA VỤ HIỆN TẠI</div><h2>{stats?.activeSeason.name ?? 'Tiến độ mùa vụ'}</h2></div></div>
          {isLoading ? <div className="animate-pulse space-y-4 p-3">{[0, 1, 2].map((item) => <div className="h-8 rounded bg-gray-100" key={item} />)}</div> : (
            <div className="live-progress-content">
              <SeasonProgressBar label="Lô an toàn cách ly" current={safeCount} total={totalLots} colorClass="bg-green-500" />
              <SeasonProgressBar label="Lô đang có cảnh báo" current={dangerCount + warningCount} total={totalLots} colorClass={dangerCount > 0 ? 'bg-red-500' : 'bg-yellow-500'} />
              <div className="progress-summary-row"><span>Đang chờ nhật ký xác nhận</span><strong>{stats?.pendingDiaries ?? '—'}</strong></div>
              <div className="progress-summary-row"><span>Sản lượng đã ghi nhận</span><strong>{stats ? `${formatNumber(stats.yieldThisSeason)} kg` : '—'}</strong></div>
              {syncState.pendingCount > 0 && <button className="outline-button progress-sync-button" type="button" onClick={() => void syncNow()} disabled={!isOnline || syncState.isSyncing}>{syncState.isSyncing ? 'Đang đồng bộ…' : `Đồng bộ ${syncState.pendingCount} nhật ký`}</button>}
            </div>
          )}
        </section>
      </div>
      {!isLoading && !loadError && <div className="dashboard-note"><span className="note-check">✓</span> Thống kê và cảnh báo được tải từ API CROP COOP.</div>}
    </div>
  )
}
