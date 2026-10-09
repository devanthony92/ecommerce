import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './icon-button.scss'

// `label` es obligatorio: es el nombre accesible del botón.
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  badge,
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx('icon-button', `icon-button--${variant}`, `icon-button--${size}`, className)}
      aria-label={label}
      {...props}
    >
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
      {badge > 0 && (
        <span className="icon-button__badge" aria-hidden="true">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
