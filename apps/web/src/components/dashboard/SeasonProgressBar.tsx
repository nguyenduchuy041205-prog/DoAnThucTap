import { ArrowUpRight, Sprout } from 'lucide-react'

interface RichProgressProps {
  seasonName: string
  percent: number
  completedLots: number
  totalLots: number
  sowingPercent: number
  carePercent: number
  harvestPercent: number
}

interface SimpleProgressProps {
  label: string
  current: number
  total: number
  colorClass?: string
}

type SeasonProgressBarProps = RichProgressProps | SimpleProgressProps

export function SeasonProgressBar(props: SeasonProgressBarProps) {
  if ('label' in props) {
    const { label, current, total, colorClass = 'bg-green-500' } = props
    const pct = total > 0 ? Math.max(0, Math.min(Math.round((current / total) * 100), 100)) : 0
    return (
      <div className="simple-season-progress">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-800">{current}/{total}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100">
          <div className={`${colorClass} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-right text-xs text-gray-500">{pct}%</p>
      </div>
    )
  }

  const { seasonName, percent, completedLots, totalLots, sowingPercent, carePercent, harvestPercent } = props
  const safePercent = Math.max(0, Math.min(percent, 100))
  return (
    <section className="panel season-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">MÙA VỤ ĐANG DIỄN RA</div>
          <h2>{seasonName}</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Xem mùa vụ"><ArrowUpRight size={17} /></button>
      </div>
      <div className="season-progress-summary">
        <div className="progress-ring" style={{ background: `conic-gradient(#628c5a ${safePercent}%, #edf1ea 0)` }}>
          <div><strong>{safePercent}%</strong><span>tiến độ</span></div>
        </div>
        <div className="season-progress-copy">
          <span className="soft-tag"><Sprout size={14} /> Vụ hè thu</span>
          <h3>{completedLots} <span>/ {totalLots} lô</span></h3>
          <p>đã hoàn thành các mốc canh tác</p>
        </div>
      </div>
      <div className="stage-list">
        <Stage label="Gieo trồng" value={sowingPercent} color="stage-green" />
        <Stage label="Chăm sóc" value={carePercent} color="stage-lime" />
        <Stage label="Thu hoạch" value={harvestPercent} color="stage-orange" />
      </div>
      <div className="season-footnote"><span className="tiny-check">✓</span> Tiến độ được cập nhật từ nhật ký đã xác nhận</div>
    </section>
  )
}

function Stage({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stage-row">
      <span className="stage-name"><i className={color} />{label}</span>
      <div className="stage-track"><span className={color} style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  )
}
