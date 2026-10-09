import clsx from 'clsx'
import { Icon } from '@/components/ui'
import './empty-state.scss'

export function EmptyState({ icon = 'inbox', title, description, action, className }) {
  return (
    <div className={clsx('empty-state', className)}>
      <span className="empty-state__icon">
        <Icon name={icon} size="xl" />
      </span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
