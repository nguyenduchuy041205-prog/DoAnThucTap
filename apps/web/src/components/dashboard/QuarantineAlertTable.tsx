import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { QuarantineStatus, SeasonLotSummary } from '../../types'
import { formatDateVN, QUARANTINE_CONFIG } from '../../lib/utils'

interface Props {
  lots: SeasonLotSummary[]
  isLoading: boolean
}

const STATUS_ORDER: Record<QuarantineStatus, number> = {
  DANGER: 0,
  WARNING: 1,
  SAFE: 2,
  NOT_APPLIED: 3,
}

export function QuarantineAlertTable({ lots, isLoading }: Props) {
  const sorted = [...lots].sort((a, b) => STATUS_ORDER[a.quarantineStatus] - STATUS_ORDER[b.quarantineStatus])

  return (
    <section className="panel alert-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">THEO DÕI AN TOÀN</div>
          <h2>Cảnh báo cách ly</h2>
        </div>
        <button className="text-link" type="button">Xem tất cả <ArrowUpRight size={15} /></button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3 p-4" aria-label="Đang tải cảnh báo">
          {[0, 1, 2, 3].map((index) => <div key={index} className="h-10 rounded-lg bg-gray-200" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm quarantine-table">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Mã lô</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nông dân</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Phun thuốc cuối</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">An toàn từ</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((lot) => {
                const config = QUARANTINE_CONFIG[lot.quarantineStatus]
                const isRestricted = lot.quarantineStatus === 'DANGER' || lot.quarantineStatus === 'WARNING'
                return (
                  <tr key={lot.id} className={`${config.bgColor} transition-colors hover:brightness-95`}>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-800">{lot.lotCode}</td>
                    <td className="py-3 px-4 text-gray-700">{lot.farmerName || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDateVN(lot.lastPesticideDate ?? null)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDateVN(lot.safeDateToHarvest)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${config.textColor}`}>
                      {lot.daysRemaining !== null
                        ? isRestricted ? `${lot.daysRemaining} ngày` : lot.quarantineStatus === 'SAFE' ? '✓ Đạt' : '—'
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sorted.length === 0 && <p className="py-8 text-center text-gray-400">Không có cảnh báo cách ly nào.</p>}
        </div>
      )}
      {!isLoading && sorted.length > 0 && <div className="table-footnote"><CalendarDays size={13} /> Ngày an toàn được tính tự động từ lần sử dụng thuốc gần nhất.</div>}
    </section>
  )
}
