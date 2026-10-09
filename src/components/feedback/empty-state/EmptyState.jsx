import clsx from 'clsx'
import { Icon } from '@/components/ui'
import './empty-state.scss'

// `compact`: dentro de tarjetas o paneles (menos espacio y h3, bajo el h2 del contenedor).
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  compact = false,
  className,
}) {
  const Heading = compact ? 'h3' : 'h2'
  return (
    <div className={clsx('empty-state', compact && 'empty-state--compact', className)}>
      <span className="empty-state__icon">
        <Icon name={icon} size={compact ? 'lg' : 'xl'} />
      </span>
      <Heading className="empty-state__title">{title}</Heading>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
