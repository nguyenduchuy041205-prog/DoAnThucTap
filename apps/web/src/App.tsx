import React, { useState } from 'react'
import {
  Users,
  Layers,
  TrendingUp,
  Package,
  CalendarCheck2,
  Activity,
  Truck,
  QrCode,
  FileText,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  ChevronRight,
  Award,
} from 'lucide-react'
import { ModuleType } from './types'
import {
  initialHouseholds,
  initialHerds,
  initialGrowthRecords,
  initialMaterials,
  initialVaccinations,
  initialHealthCases,
  initialMovements,
  initialTraceQrs,
  initialContracts,
  initialOrders,
  initialFinancials,
} from './lib/mockData'

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQrPreview, setShowQrPreview] = useState(false)

  // State data for all 10 modules
  const [households] = useState(initialHouseholds)
  const [herds, setHerds] = useState(initialHerds)
  const [growthList] = useState(initialGrowthRecords)
  const [materials] = useState(initialMaterials)
  const [vaccinations, setVaccinations] = useState(initialVaccinations)
  const [healthCases] = useState(initialHealthCases)
  const [movements] = useState(initialMovements)
  const [traceQrs] = useState(initialTraceQrs)
  const [contracts] = useState(initialContracts)
  const [orders] = useState(initialOrders)
  const [financials] = useState(initialFinancials)

  // Form states for adding herd
  const [newBatchCode, setNewBatchCode] = useState('')
  const [newQuantity, setNewQuantity] = useState(50)
  const [newBreed, setNewBreed] = useState('Heo Duroc F1')
  const [newHousehold, setNewHousehold] = useState('Hộ Ba Thành')

  // Top summary KPIs
  const totalHerdsCount = herds.reduce((sum, h) => sum + h.currentQuantity, 0)
  const totalHouseholdsCount = households.length
  const completedVaccines = vaccinations.filter((v) => v.isCompleted).length
  const vaccineRate = Math.round((completedVaccines / vaccinations.length) * 100) || 100
  const totalProfitAll = financials.reduce((sum, f) => sum + f.netProfit, 0)

  const handleAddHerd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchCode) return
    const newHerd = {
      id: `hd-${Date.now()}`,
      batchCode: newBatchCode,
      householdName: newHousehold,
      animalType: 'PIG' as const,
      breedName: newBreed,
      currentQuantity: Number(newQuantity),
      initialQuantity: Number(newQuantity),
      entryDate: new Date().toISOString().split('T')[0],
      avgCurrentWeightKg: 20,
      targetWeightKg: 105,
      status: 'RAISING' as const,
      daysRemainingWithdrawal: 0,
    }
    setHerds([newHerd, ...herds])
    setShowAddModal(false)
    setNewBatchCode('')
  }

  const toggleVaccineComplete = (id: string) => {
    setVaccinations(
      vaccinations.map((v) =>
        v.id === id ? { ...v, isCompleted: !v.isCompleted, executedDate: !v.isCompleted ? new Date().toISOString().split('T')[0] : undefined } : v
      )
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
              <Building2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                HTX CHĂN NUÔI MINH TRUNG — TÂY NINH
                <span className="text-xs font-medium bg-emerald-700/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-600">
                  CĐS 2026
                </span>
              </h1>
              <p className="text-xs text-emerald-200/90">
                Hệ thống Quản lý Chăn nuôi Tập thể & Hộ chiếu Truy xuất Nguồn gốc Số
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQrPreview(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition border border-emerald-400/30"
            >
              <QrCode className="w-4 h-4" />
              Quét Hộ Chiếu QR
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-emerald-200">Người dùng</div>
              <div className="text-sm font-semibold">Ban Quản Trị HTX</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Menu: 10 Chức Năng Cốt Lõi */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sticky top-20">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Phân Hệ Nghiệp Vụ (10 Phân Hệ)
            </div>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Tổng Quan Bảng Điều Khiển', icon: Layers },
                { id: 'households', label: '1. Hộ Chăn Nuôi & Thành Viên', icon: Users },
                { id: 'herds', label: '2. Đàn Vật Nuôi & Nguồn Giống', icon: Award },
                { id: 'growth', label: '3. Chăm Sóc & Tăng Trưởng (FCR)', icon: TrendingUp },
                { id: 'inventory', label: '4. Thức Ăn, Thuốc & Vật Tư', icon: Package },
                { id: 'vaccination', label: '5. Lịch Tiêm Phòng & Khử Trùng', icon: CalendarCheck2 },
                { id: 'health', label: '6. Sức Khỏe & Trừ Kháng Sinh', icon: Activity },
                { id: 'movements', label: '7. Nhập Đàn, Xuất Đàn & Bán', icon: Truck },
                { id: 'traceability', label: '8. Hộ Chiếu Số & Truy Xuất QR', icon: QrCode },
                { id: 'orders', label: '9. Khách Hàng, Đơn & Hợp Đồng', icon: FileText },
                { id: 'financials', label: '10. Tổng Hợp Chi Phí & Hiệu Quả', icon: DollarSign },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as ModuleType)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />}
                  </button>
                )
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 px-3">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-xs text-emerald-800">
                <div className="font-bold flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Chuẩn VietGAHP & ATVSTP
                </div>
                Hồ sơ điện tử có giá trị kiểm chứng và phục vụ thanh tra chất lượng.
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng Đàn Đang Nuôi</p>
                <p className="text-2xl font-bold text-slate-900">{totalHerdsCount} <span className="text-xs font-normal text-slate-500">con</span></p>
                <span className="text-[11px] text-emerald-600 font-medium">3 đàn (Heo thịt & Bò 3B)</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Hộ Chăn Nuôi Thành Viên</p>
                <p className="text-2xl font-bold text-slate-900">{totalHouseholdsCount} <span className="text-xs font-normal text-slate-500">hộ</span></p>
                <span className="text-[11px] text-emerald-600 font-medium">100% đạt chuẩn an toàn</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Tỷ Lệ Tiêm Phòng Vắc-xin</p>
                <p className="text-2xl font-bold text-slate-900">{vaccineRate}%</p>
                <span className="text-[11px] text-emerald-600 font-medium">3/4 đợt hoàn thành</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Lợi Nhuận Ròng Dự Kiến</p>
                <p className="text-2xl font-bold text-emerald-600">{(totalProfitAll / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-500">triệu</span></p>
                <span className="text-[11px] text-slate-500 font-medium">FCR bình quân 2.42</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 0: TỔNG QUAN (OVERVIEW) */}
          {/* ========================================================================= */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-amber-900">
                  <div className="font-bold">Giám Sát Thời Gian Ngưng Thuốc Thú Y (Withdrawal Period)</div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Đàn <strong>DAN-2026-HEO-01</strong> đã hoàn thành cách ly kháng sinh 16 ngày (ngày an toàn: 29/10/2026) → <strong>Đủ điều kiện xuất chuồng an toàn và cấp mã QR Hộ Chiếu Thịt Sạch</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModule('traceability')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition"
                >
                  Xem Mã QR
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Đàn Vật Nuôi Đang Nuôi Tại Các Hộ</h3>
                    <p className="text-xs text-slate-500">Theo dõi tiến độ tăng trọng và ngày dự kiến xuất chuồng</p>
                  </div>
                  <button
                    onClick={() => setActiveModule('herds')}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Xem tất cả ({herds.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Mã Đàn</th>
                        <th className="py-2.5 px-3">Hộ Nuôi</th>
                        <th className="py-2.5 px-3">Giống</th>
                        <th className="py-2.5 px-3">Số Lượng</th>
                        <th className="py-2.5 px-3">Trọng Lượng Hiện Tại</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {herds.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{h.batchCode}</td>
                          <td className="py-2.5 px-3">{h.householdName}</td>
                          <td className="py-2.5 px-3">{h.breedName}</td>
                          <td className="py-2.5 px-3 font-medium">{h.currentQuantity} con</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">{h.avgCurrentWeightKg} kg</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                h.status === 'READY_TO_SELL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {h.status === 'READY_TO_SELL' ? 'Đạt Chuẩn Xuất Bán' : 'Đang Nuôi'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                    Lịch Tiêm Chủng & Sát Trùng Chuồng Trại
                  </h3>
                  <div className="space-y-3 mt-3">
                    {vaccinations.slice(0, 3).map((v) => (
                      <div key={v.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{v.title}</div>
                          <div className="text-slate-500">Đàn: {v.batchCode} | Ngày: {v.scheduledDate}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-md font-bold text-[10px] ${v.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {v.isCompleted ? 'ĐÃ HOÀN THÀNH' : 'SẮP ĐẾN HẠN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Tồn Kho Thức Ăn & Thuốc Thú Y Trọng Điểm
                  </h3>
                  <div className="space-y-3 mt-3">
                    {materials.map((m) => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{m.name}</div>
                          <div className="text-slate-500">Đơn vị: {m.unit} | Giá: {m.unitPrice.toLocaleString('vi-VN')} đ</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{m.currentStock}</span> {m.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 1: QUẢN LÝ THÀNH VIÊN VÀ HỘ CHĂN NUÔI */}
          {/* ========================================================================= */}
          {activeModule === 'households' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Danh Sách Hộ Chăn Nuôi & Thành Viên HTX</h2>
                  <p className="text-xs text-slate-500">Quản lý định danh hộ, quy mô sức chứa, chứng nhận VietGAHP</p>
                </div>
                <button
                  onClick={() => alert('Chức năng thêm Hộ chăn nuôi mới')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Thêm Hộ Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {households.map((h) => (
                  <div key={h.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 transition space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        {h.householdCode}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {h.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{h.householderName}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {h.phone}
                    </div>
                    <div className="text-xs text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{h.address}, {h.commune}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between text-xs text-slate-700">
                      <span>Sức chứa: <strong>{h.capacityHead} con</strong></span>
                      <span className="text-emerald-700">Đang nuôi: <strong>{h.currentHeadCount} con</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Chứng nhận: {h.bioSecurityCert}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 2: QUẢN LÝ ĐÀN, NHÓM VẬT NUÔI VÀ NGUỒN GIỐNG */}
          {/* ========================================================================= */}
          {activeModule === 'herds' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quản Lý Đàn & Nguồn Giống Vật Nuôi</h2>
                  <p className="text-xs text-slate-500">Mã định danh đàn, cơ sở giống, số lượng và cân nặng mục tiêu</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Tạo Đàn / Nhập Giống Mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Mã Đàn</th>
                      <th className="py-3 px-3">Hộ Phụ Trách</th>
                      <th className="py-3 px-3">Giống Vật Nuôi</th>
                      <th className="py-3 px-3">Ngày Nhập</th>
                      <th className="py-3 px-3">Số Lượng</th>
                      <th className="py-3 px-3">Trọng Lượng (TB/Mục Tiêu)</th>
                      <th className="py-3 px-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {herds.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{h.batchCode}</td>
                        <td className="py-3 px-3">{h.householdName}</td>
                        <td className="py-3 px-3 font-medium text-emerald-800">{h.breedName}</td>
                        <td className="py-3 px-3 text-slate-500">{h.entryDate}</td>
                        <td className="py-3 px-3 font-semibold">{h.currentQuantity} con</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-700">{h.avgCurrentWeightKg} kg</span> / {h.targetWeightKg} kg
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${h.status === 'READY_TO_SELL' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {h.status === 'READY_TO_SELL' ? 'Sẵn sàng xuất chuồng' : 'Đang nuôi thịt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 3: THEO DÕI QUÁ TRÌNH CHĂM SÓC VÀ TĂNG TRƯỞNG */}
          {/* ========================================================================= */}
          {activeModule === 'growth' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nhật Ký Cân Đo Tăng Trưởng & Chỉ Số FCR</h2>
                  <p className="text-xs text-slate-500">Đo lường tăng trọng bình quân ngày (ADG) và hiệu quả tiêu tốn thức ăn</p>
                </div>
                <button
                  onClick={() => alert('Mở form ghi nhận cân mẫu định kỳ')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Ghi Cân Đo Mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Mã Đàn</th>
                      <th className="py-3 px-3">Ngày Cân</th>
                      <th className="py-3 px-3">Ngày Tuổi</th>
                      <th className="py-3 px-3">Cân Nặng TB</th>
                      <th className="py-3 px-3">Tăng Trọng/Ngày (ADG)</th>
                      <th className="py-3 px-3">Hệ Số FCR</th>
                      <th className="py-3 px-3">Người Cân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {growthList.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{g.batchCode}</td>
                        <td className="py-3 px-3">{g.recordDate}</td>
                        <td className="py-3 px-3">{g.daysOfAge} ngày</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{g.avgWeightKg} kg</td>
                        <td className="py-3 px-3 font-medium text-blue-600">+{g.dailyGainGram} g/ngày</td>
                        <td className="py-3 px-3 font-bold text-purple-700">{g.fcr}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{g.recorder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 4: QUẢN LÝ THỨC ĂN, THUỐC THÚ Y VÀ VẬT TƯ */}
          {/* ========================================================================= */}
          {activeModule === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Kho Thức Ăn, Thuốc Thú Y & Vật Tư</h2>
                  <p className="text-xs text-slate-500">Kiểm soát tồn kho, định mức cấp phát, thời gian ngưng thuốc</p>
                </div>
                <button
                  onClick={() => alert('Mở phiếu nhập kho vật tư')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Nhập Kho Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-slate-500">{m.code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                        {m.type}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                    <div className="text-xs text-slate-600">Nhà cung cấp: <strong>{m.supplier}</strong></div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
                      <div>
                        Tồn kho: <span className="font-bold text-emerald-700 text-sm">{m.currentStock}</span> {m.unit}
                      </div>
                      <div className="text-slate-500">
                        Giá: {m.unitPrice.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    {m.withdrawalDays > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Thời gian ngưng thuốc bắt buộc: <strong>{m.withdrawalDays} ngày</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 5: LỊCH TIÊM PHÒNG, VỆ SINH VÀ KHỬ TRÙNG */}
          {/* ========================================================================= */}
          {activeModule === 'vaccination' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Lịch Tiêm Phòng & Tiêu Độc Khử Trùng</h2>
                  <p className="text-xs text-slate-500">Theo dõi tiêm chủng định kỳ theo ngày tuổi & vệ sinh chuồng trại</p>
                </div>
                <button
                  onClick={() => alert('Mở lịch hẹn tiêm phòng mới')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Thêm Lịch Mới
                </button>
              </div>

              <div className="space-y-3">
                {vaccinations.map((v) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                      v.isCompleted ? 'bg-slate-50/80 border-slate-200' : 'bg-emerald-50/30 border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{v.title}</span>
                        <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {v.batchCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Lịch hẹn: <strong>{v.scheduledDate}</strong> (Ngày tuổi thứ {v.targetAgeDays}) | Liều: {v.dosage}
                      </div>
                      <div className="text-xs text-slate-600">Phụ trách: {v.assignedTo}</div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        onClick={() => toggleVaccineComplete(v.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                          v.isCompleted
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {v.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã tiêm'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 6: THEO DÕI SỨC KHỎE, DỊCH BỆNH VÀ ĐIỀU TRỊ */}
          {/* ========================================================================= */}
          {activeModule === 'health' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Theo Dõi Sức Khỏe & Nhật Ký Điều Trị</h2>
                  <p className="text-xs text-slate-500">Giám sát ca bệnh, cách ly và cảnh báo thời gian ngưng thuốc an toàn</p>
                </div>
                <button
                  onClick={() => alert('Mở ca báo cáo dịch bệnh / điều trị')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Báo Ca Bệnh Mới
                </button>
              </div>

              <div className="space-y-4">
                {healthCases.map((hc) => (
                  <div key={hc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-900">Đàn: {hc.batchCode}</span>
                        <span className="text-xs text-slate-500 ml-2">Ngày phát hiện: {hc.reportedDate}</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {hc.condition} (Khỏi bệnh)
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p><strong className="text-slate-700">Triệu chứng:</strong> {hc.symptoms}</p>
                      <p><strong className="text-slate-700">Chẩn đoán:</strong> {hc.diagnosis}</p>
                      <p><strong className="text-slate-700">Phác đồ thuốc:</strong> {hc.medicineUsed}</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Thời gian ngưng thuốc: <strong>{hc.withdrawalDays} ngày</strong></span>
                      </div>
                      <span className="font-semibold text-emerald-700">Ngày xuất chuồng an toàn: {hc.safeDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 7: QUẢN LÝ NHẬP ĐÀN, XUẤT ĐÀN VÀ TIÊU THỤ */}
          {/* ========================================================================= */}
          {activeModule === 'movements' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quản Lý Nhập Đàn, Xuất Đàn & Tiêu Thụ</h2>
                  <p className="text-xs text-slate-500">Lịch sử xuất bán, cân nặng xuất chuồng, giá trị giao dịch</p>
                </div>
                <button
                  onClick={() => alert('Mở phiếu xuất đàn thương phẩm')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Lập Phiếu Xuất/Nhập
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Loại</th>
                      <th className="py-3 px-3">Mã Đàn</th>
                      <th className="py-3 px-3">Ngày</th>
                      <th className="py-3 px-3">Số Lượng</th>
                      <th className="py-3 px-3">Tổng Khối Lượng</th>
                      <th className="py-3 px-3">Đơn Giá</th>
                      <th className="py-3 px-3">Tổng Tiền (VNĐ)</th>
                      <th className="py-3 px-3">Đối Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((mv) => (
                      <tr key={mv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              mv.type === 'EXPORT_SALE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {mv.type === 'EXPORT_SALE' ? 'XUẤT BÁN' : 'NHẬP GIỐNG'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{mv.batchCode}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{mv.date}</td>
                        <td className="py-3 px-3 font-medium">{mv.quantity} con</td>
                        <td className="py-3 px-3">{mv.totalWeightKg.toLocaleString()} kg</td>
                        <td className="py-3 px-3">{mv.unitPriceKg.toLocaleString()} đ/kg</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{mv.totalValue.toLocaleString('vi-VN')} đ</td>
                        <td className="py-3 px-3 text-xs">{mv.partnerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 8: TRUY XUẤT NGUỒN GỐC VẬT NUÔI HOẶC SẢN PHẨM */}
          {/* ========================================================================= */}
          {activeModule === 'traceability' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Hộ Chiếu Vật Nuôi Số & Truy Xuất Nguồn Gốc QR</h2>
                  <p className="text-xs text-slate-500">Khách hàng và siêu thị quét mã QR để kiểm tra toàn bộ lý lịch VietGAHP</p>
                </div>
                <button
                  onClick={() => setShowQrPreview(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4" /> Mở Thẻ Tra Cứu Số
                </button>
              </div>

              {traceQrs.map((qr) => (
                <div key={qr.id} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-sm text-slate-700 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{qr.productName}</span>
                      <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        {qr.qrStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">Đàn: <strong>{qr.batchCode}</strong> | Hộ nuôi: <strong>{qr.householdName}</strong></p>
                    <p className="text-xs text-slate-600">Giống: <strong>{qr.breedName}</strong> | Ngày xuất: <strong>{qr.harvestDate}</strong></p>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tiêm chủng 100%
                      </div>
                      <div className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ngưng kháng sinh đủ 16 ngày
                      </div>
                      <div className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Thú y duyệt an toàn
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                    <div className="w-28 h-28 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-center p-2 text-xs">
                      [QR CODE]
                      <br />
                      {qr.token}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 font-medium">Lượt quét: {qr.scanCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 9: QUẢN LÝ KHÁCH HÀNG, ĐƠN HÀNG VÀ HỢP ĐỒNG */}
          {/* ========================================================================= */}
          {activeModule === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Hợp Đồng Bao Tiêu & Khách Hàng Tiêu Thụ</h2>
                <p className="text-xs text-slate-500 mb-4">Các hợp đồng liên kết tiêu thụ với doanh nghiệp và chuỗi bán lẻ</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contracts.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {c.contractNo}
                        </span>
                        <span className="text-xs text-slate-500">Hạn đến: {c.expiryDate}</span>
                      </div>
                      <div className="font-bold text-slate-900">{c.buyerName}</div>
                      <div className="text-xs text-slate-600">Loại hợp đồng: {c.contractType}</div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
                        <span>Cam kết: <strong>{c.committedQtyHead} con</strong></span>
                        <span className="font-bold text-emerald-700">{c.contractValue.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3">Đơn Đặt Hàng & Giao Nhận</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Mã Đơn</th>
                        <th className="py-2.5 px-3">Khách Hàng</th>
                        <th className="py-2.5 px-3">Điện Thoại</th>
                        <th className="py-2.5 px-3">Ngày Giao</th>
                        <th className="py-2.5 px-3">Tổng Tiền</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{o.orderNo}</td>
                          <td className="py-2.5 px-3">{o.customerName}</td>
                          <td className="py-2.5 px-3 text-xs">{o.phone}</td>
                          <td className="py-2.5 px-3 text-xs text-slate-500">{o.deliveryDate}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">{o.totalAmount.toLocaleString('vi-VN')} đ</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHÂN HỆ 10: TỔNG HỢP CHI PHÍ, SẢN LƯỢNG VÀ HIỆU QUẢ CHĂN NUÔI */}
          {/* ========================================================================= */}
          {activeModule === 'financials' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Báo Cáo Tổng Hợp Chi Phí & Hiệu Quả Kinh Tế</h2>
                  <p className="text-xs text-slate-500">Chi tiết cơ cấu chi phí (con giống, cám, thú y, nhân công) và lợi nhuận ròng</p>
                </div>
                <button
                  onClick={() => alert('Xuất file Excel báo cáo tài chính chăn nuôi')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  Xuất Báo Cáo Excel
                </button>
              </div>

              <div className="space-y-4">
                {financials.map((f, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 text-base">{f.batchCode}</span>
                        <span className="text-xs text-slate-500 ml-2">({f.householdName})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Lợi nhuận ròng: </span>
                        <span className="text-base font-bold text-emerald-700">
                          +{f.netProfit.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Tiền Con Giống:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{f.breedCost.toLocaleString('vi-VN')} đ</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Tiền Thức Ăn Cám:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{f.feedCost.toLocaleString('vi-VN')} đ</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Thú Y & Vắc-xin:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{f.vetCost.toLocaleString('vi-VN')} đ</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Nhân Công & Khác:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{f.laborCost.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs pt-2 text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                      <div>Tổng chi phí: <strong>{f.totalCost.toLocaleString('vi-VN')} đ</strong></div>
                      <div>Doanh thu xuất bán: <strong className="text-emerald-700">{f.totalRevenue.toLocaleString('vi-VN')} đ</strong></div>
                      <div>Hệ số FCR: <strong className="text-purple-700">{f.fcr}</strong></div>
                      <div>Lợi nhuận / con: <strong className="text-emerald-700">+{Math.round(f.profitPerHead).toLocaleString('vi-VN')} đ</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Thêm đàn mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tạo Đàn Mới & Giao Hộ Chăn Nuôi</h3>
            <form onSubmit={handleAddHerd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mã Định Danh Đàn</label>
                <input
                  type="text"
                  required
                  placeholder="VD: DAN-2026-HEO-03"
                  value={newBatchCode}
                  onChange={(e) => setNewBatchCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hộ Chăn Nuôi Tiếp Nhận</label>
                <select
                  value={newHousehold}
                  onChange={(e) => setNewHousehold(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Nguyễn Văn Thành (Hộ Ba Thành)</option>
                  <option>Trần Thị Thảo (Hộ Bảy Thảo)</option>
                  <option>Lê Hoàng Dũng (Trại bò Dũng Phát)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giống Vật Nuôi</label>
                <input
                  type="text"
                  value={newBreed}
                  onChange={(e) => setNewBreed(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Số Lượng Con Giống</label>
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Lưu Đàn Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Giả lập Quét QR Hộ Chiếu Số Người Tiêu Dùng */}
      {showQrPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Hộ Chiếu Vật Nuôi Số (VietGAHP)
              </span>
              <h3 className="font-bold text-slate-900 text-base">Thịt Heo Sạch HTX Minh Trung</h3>
              <p className="text-xs text-slate-500">Mã Lô: THIT-HEO-SACH-MT-01</p>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Hộ chăn nuôi:</span>
                <span className="font-bold">Ba Thành (Tân Phú, Tây Ninh)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giống vật nuôi:</span>
                <span className="font-bold">Heo thịt Duroc F1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thức ăn:</span>
                <span className="font-bold">Cám De Heus chứng nhận</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vắc-xin phòng bệnh:</span>
                <span className="font-bold text-emerald-700">100% Đầy đủ 3 mũi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kiểm dịch & ngưng thuốc:</span>
                <span className="font-bold text-emerald-700">An toàn tuyệt đối (16 ngày)</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              Cơ sở dữ liệu được xác thực bởi Cán bộ thú y & Ban Quản trị HTX Minh Trung.
            </div>

            <button
              onClick={() => setShowQrPreview(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-400">
        Đồ án thực tập: Hệ Thống Quản Lý Chuyển Đổi Số HTX Chăn Nuôi — Trường Đại học An Giang & HTX Dịch Vụ Nông Nghiệp Minh Trung (Tây Ninh) 2026.
      </footer>
    </div>
  )
}
