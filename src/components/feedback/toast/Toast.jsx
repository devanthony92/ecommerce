import { useEffect } from 'react'
import clsx from 'clsx'
import { Icon, IconButton } from '@/components/ui'
import './toast.scss'

const ICON_BY_TONE = { info: 'info', success: 'check', warning: 'alert', danger: 'alert' }

export function Toast({ id, title, description, tone, duration, onDismiss }) {
  useEffect(() => {
    if (!duration) return undefined
    const timer = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  // Los errores interrumpen (alert); el resto lo anuncia la región aria-live.
  return (
    <div className={clsx('toast', `toast--${tone}`)} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={ICON_BY_TONE[tone]} className="toast__icon" />
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        {description && <p className="toast__description">{description}</p>}
      </div>
      <IconButton
        icon="close"
        label="Cerrar notificación"
        size="sm"
        onClick={() => onDismiss(id)}
      />
    </div>
  )
}
