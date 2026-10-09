import clsx from 'clsx'
import { Button } from '@/components/ui'
import './auth-form.scss'

// Contenedor común de los formularios de acceso: campos, error general y envío.
export function AuthForm({ onSubmit, formError, isSubmitting, submitLabel, className, children }) {
  return (
    <form className={clsx('auth-form', className)} onSubmit={onSubmit} noValidate>
      {children}
      {formError && (
        <p className="auth-form__error" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" block loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
