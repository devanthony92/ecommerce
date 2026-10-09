import clsx from 'clsx'
import './spinner.scss'

// Sin `label` es decorativo (aria-hidden); con `label` anuncia el estado.
export function Spinner({ size = 'md', label, className }) {
  if (!label) {
    return <span className={clsx('spinner', `spinner--${size}`, className)} aria-hidden="true" />
  }

  return (
    <span className={clsx('spinner', `spinner--${size}`, className)} role="status">
      <span className="spinner__label">{label}</span>
    </span>
  )
}
