import clsx from 'clsx'
import './form-error.scss'

// Error general de un formulario (no asociado a un campo). role="alert": se anuncia al aparecer.
export function FormError({ children, className }) {
  if (!children) return null
  return (
    <p className={clsx('form-error', className)} role="alert">
      {children}
    </p>
  )
}
