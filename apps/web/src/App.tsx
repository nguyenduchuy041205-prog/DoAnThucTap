import { useState } from 'react'
import { Bell, BookOpenCheck, ChevronDown, CircleHelp, Cloud, CloudOff, Command, Grid2X2, Leaf, Menu, Search, Settings2, Sprout, UsersRound } from 'lucide-react'
import type { MaterialOption, SeasonLotSummary } from './types'
import { Dashboard } from './components/dashboard/Dashboard'
import { EDiaryForm } from './components/diary/EDiaryForm'
import { useOfflineSync } from './hooks/useOfflineSync'

const seasonLots: SeasonLotSummary[] = [
  { id: '7d55ce5a-a246-4675-9333-615ee3b78588', lotCode: 'LOT-BTH-01-A', lotName: 'Ruộng Cầu Đình', cropType: 'Lúa ST25', seasonName: 'Hè Thu 2026', farmerName: 'Nguyễn Văn Minh', quarantineStatus: 'SAFE', daysRemaining: 0, safeDateToHarvest: null, status: 'ACTIVE' },
  { id: '0d11d332-3b4d-44c1-b6d1-da906cd5cf2c', lotCode: 'LOT-BTH-02-B', lotName: 'Ruộng Bờ Tre', cropType: 'Lúa ST25', seasonName: 'Hè Thu 2026', farmerName: 'Nguyễn Văn Minh', quarantineStatus: 'WARNING', daysRemaining: 2, safeDateToHarvest: '2026-11-11', status: 'ACTIVE' },
  { id: '2c69fc57-4542-41db-a1c9-f16255f6cfc8', lotCode: 'LOT-GT-04-C', lotName: 'Vườn Mương Đào', cropType: 'Dừa hữu cơ', seasonName: 'Hè Thu 2026', farmerName: 'Nguyễn Văn Minh', quarantineStatus: 'NOT_APPLIED', daysRemaining: null, safeDateToHarvest: null, status: 'ACTIVE' },
]

const materials: MaterialOption[] = [
  { id: 'f67f9335-4d5c-4b25-a5af-65d215c92821', name: 'Phân hữu cơ vi sinh', unit: 'kg', category: 'FERTILIZER', quarantineDays: 0 },
  { id: '93d829ac-3fd0-4a22-9375-b86c8974d1aa', name: 'NPK 16-16-8', unit: 'kg', category: 'FERTILIZER', quarantineDays: 0 },
  { id: '67b5a20b-2ad6-4aa4-a269-dde2607f1558', name: 'Chế phẩm sinh học Neem', unit: 'lít', category: 'PESTICIDE', quarantineDays: 14 },
]

export default function App() {
  const [page, setPage] = useState<'dashboard' | 'diary'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isOnline, syncState, isSyncing, pendingCount, lastSyncMessage, syncNow, refreshCount } = useOfflineSync()

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><span className="brand-mark"><Sprout size={22} strokeWidth={2.3} /></span><span><strong>cropcoop</strong><small>NÔNG NGHIỆP BỀN VỮNG</small></span></div>
        <div className="coop-switcher"><span className="coop-avatar">HT</span><span><strong>HTX Hương Tràm</strong><small>Hợp tác xã nông nghiệp</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">KHÔNG GIAN LÀM VIỆC</div>
        <nav className="side-nav">
          <button className={page === 'dashboard' ? 'nav-item nav-active' : 'nav-item'} onClick={() => { setPage('dashboard'); setSidebarOpen(false) }}><Grid2X2 size={18} /> Tổng quan <span className="nav-shortcut"><Command size={11} /> 1</span></button>
          <button className="nav-item" onClick={() => setPage('dashboard')}><Sprout size={18} /> Mùa vụ & lô</button>
          <button className={page === 'diary' ? 'nav-item nav-active' : 'nav-item'} onClick={() => { setPage('diary'); setSidebarOpen(false) }}><BookOpenCheck size={18} /> Nhật ký sản xuất <span className="nav-count">12</span></button>
          <button className="nav-item" onClick={() => setPage('dashboard')}><UsersRound size={18} /> Thành viên</button>
        </nav>
        <div className="nav-caption nav-caption-space">QUẢN LÝ HTX</div>
        <nav className="side-nav">
          <button className="nav-item" onClick={() => setPage('dashboard')}><Leaf size={18} /> Kho vật tư</button>
          <button className="nav-item" onClick={() => setPage('dashboard')}><Settings2 size={18} /> Cài đặt</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><strong>Cần hỗ trợ?</strong><p>Xem hướng dẫn sử dụng CROP COOP.</p><button type="button">Trung tâm trợ giúp <span>↗</span></button></div>
          <div className="profile-row"><div className="profile-avatar">NM</div><span><strong>Nguyễn Văn Minh</strong><small>Nông hộ · FARMER</small></span><MoreDots /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" type="button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Mở điều hướng"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>HTX Hương Tràm</span><span className="crumb-slash">/</span><strong>{page === 'dashboard' ? 'Tổng quan' : 'Nhật ký sản xuất'}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={16} /><input placeholder="Tìm kiếm..." /><kbd>⌘ K</kbd></label>
            <button className={`sync-status ${isOnline ? 'sync-online' : 'sync-offline'}`} type="button" onClick={() => void syncNow()} title={lastSyncMessage || (isOnline ? 'Đang có kết nối' : 'Mất kết nối')}>
              {isOnline ? <Cloud size={16} /> : <CloudOff size={16} />}<span>{isSyncing ? 'Đang đồng bộ' : isOnline ? 'Đã kết nối' : 'Ngoại tuyến'}</span>{pendingCount > 0 && <b>{pendingCount}</b>}
            </button>
            <button className="notification-button" type="button" aria-label="Thông báo"><Bell size={18} /><i /></button>
            <div className="top-avatar">NM</div>
          </div>
        </header>

        {pendingCount > 0 && <div className="sync-banner"><span className="sync-banner-icon"><Cloud size={16} /></span><span><strong>{pendingCount} nhật ký đang chờ đồng bộ</strong>{lastSyncMessage && <small>{lastSyncMessage}</small>}</span><button type="button" onClick={() => void syncNow()} disabled={!isOnline || isSyncing}>{isSyncing ? 'Đang gửi...' : 'Đồng bộ ngay'} <span>→</span></button></div>}

        {page === 'dashboard'
          ? <Dashboard onCreateDiary={() => setPage('diary')} isOnline={isOnline} syncState={syncState} syncNow={syncNow} />
          : <EDiaryForm
              seasonLotId={seasonLots[0].id}
              lotCode={seasonLots[0].lotCode}
              availableMaterials={materials}
              isOnline={isOnline}
              syncState={syncState}
              refreshPendingCount={refreshCount}
              onCancel={() => setPage('dashboard')}
            />}
      </main>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

function MoreDots() { return <button type="button" className="more-dots" aria-label="Tùy chọn tài khoản">•••</button> }
