import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './icon-button.scss'

/**
 * `label` es obligatorio: es el nombre accesible del botón.
 * `as` permite usarlo como enlace: <IconButton as={Link} to="/cuenta" icon="user" label="Mi cuenta" />
 */
export function IconButton({
  as: Component = 'button',
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  badge,
  type,
  className,
  ...props
}) {
  return (
    <Component
      className={clsx('icon-button', `icon-button--${variant}`, `icon-button--${size}`, className)}
      aria-label={label}
      {...(Component === 'button' && { type: type ?? 'button' })}
      {...props}
    >
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
      {badge > 0 && (
        <span className="icon-button__badge" aria-hidden="true">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Component>
  )
}
