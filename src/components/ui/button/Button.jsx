import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import { Spinner } from '../spinner/Spinner'
import './button.scss'

/**
 * `as` permite renderizar un Link con el mismo estilo:
 * <Button as={Link} to="/carrito">Ver carrito</Button>
 */
export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  iconStart,
  iconEnd,
  disabled,
  type,
  className,
  children,
  ...props
}) {
  const isNativeButton = Component === 'button'

  return (
    <Component
      className={clsx(
        'button',
        `button--${variant}`,
        `button--${size}`,
        block && 'button--block',
        loading && 'button--loading',
        className,
      )}
      {...(isNativeButton
        ? { type: type ?? 'button', disabled: disabled || loading }
        : { 'aria-disabled': disabled || loading || undefined })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="button__spinner" />
      ) : (
        iconStart && <Icon name={iconStart} size="sm" className="button__icon" />
      )}
      <span className="button__label">{children}</span>
      {iconEnd && !loading && <Icon name={iconEnd} size="sm" className="button__icon" />}
    </Component>
  )
}
