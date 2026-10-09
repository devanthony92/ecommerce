import clsx from 'clsx'
import './progress-bar.scss'

/**
 * Barra de progreso accesible. El porcentaje lo calcula el backend o el
 * componente de negocio; aquí solo se representa.
 * tone: primary | wholesale | success
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = 'primary',
  size = 'md',
  className,
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={clsx('progress-bar', `progress-bar--${tone}`, `progress-bar--${size}`, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
    >
      <span className="progress-bar__fill" style={{ inlineSize: `${percent}%` }} />
    </div>
  )
}
