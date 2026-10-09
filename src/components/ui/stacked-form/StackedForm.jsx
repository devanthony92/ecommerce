import clsx from 'clsx'
// Ruta directa: evita un ciclo entre los barrels de ui y feedback.
import { FormError } from '../../feedback/form-error/FormError'
import { Button } from '../button/Button'
import './stacked-form.scss'

/**
 * Formulario en una columna: campos, error general y botón de envío.
 * `blockSubmit`: botón a todo el ancho (formularios de acceso).
 */
export function StackedForm({
  onSubmit,
  formError,
  isSubmitting,
  submitLabel,
  blockSubmit = false,
  className,
  children,
}) {
  return (
    <form className={clsx('stacked-form', className)} onSubmit={onSubmit} noValidate>
      {children}
      <FormError>{formError}</FormError>
      <Button
        type="submit"
        block={blockSubmit}
        loading={isSubmitting}
        className="stacked-form__submit"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
