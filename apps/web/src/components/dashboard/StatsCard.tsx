import type { KeyboardEvent } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  /** New API names. */
  title?: string
  subtitle?: string
  colorClass?: string
  /** Existing Dashboard aliases. */
  label?: string
  detail?: string
  tone?: 'green' | 'orange' | 'blue' | 'violet'
  value: string | number
  icon: LucideIcon | string
  onClick?: () => void
}

const toneClasses = {
  green: 'stat-icon-green',
  orange: 'stat-icon-orange',
  blue: 'stat-icon-blue',
  violet: 'stat-icon-violet',
}

export function StatsCard({ title, label, value, subtitle, detail, icon, colorClass, tone = 'green', onClick }: StatsCardProps) {
  const heading = title ?? label ?? ''
  const caption = subtitle ?? detail
  const isLegacyStyle = !colorClass
  const Icon = typeof icon === 'string' ? null : icon
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <article
      className={`${isLegacyStyle ? 'stat-card' : `rounded-2xl p-5 shadow-sm border border-white/20 cursor-pointer transition-transform hover:scale-[1.02] ${colorClass}`} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <span className={isLegacyStyle ? `stat-icon ${toneClasses[tone]}` : 'text-4xl opacity-90'}>
          {Icon ? <Icon size={19} strokeWidth={1.9} /> : <span aria-hidden="true">{typeof icon === 'string' ? icon : null}</span>}
        </span>
        {caption && <span className={isLegacyStyle ? 'stat-detail' : 'stat-detail !text-white/70'}>{caption}</span>}
      </div>
      <p className={isLegacyStyle ? 'stat-label' : 'stat-label !text-white/80'}>{heading}</p>
      <p className={isLegacyStyle ? 'stat-value' : 'stat-value !text-white'}>{value}</p>
    </article>
  )
}
