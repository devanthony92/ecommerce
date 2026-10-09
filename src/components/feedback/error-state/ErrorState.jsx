import clsx from 'clsx'
import { Button, Icon } from '@/components/ui'
import './error-state.scss'

/**
 * Error recuperable. `error` suele ser un ApiError (tiene `message` legible).
 * Con `onRetry` muestra el botón Reintentar.
 */
export function ErrorState({
  title = 'No pudimos cargar esta información',
  error,
  onRetry,
  isRetrying = false,
  className,
}) {
  return (
    <div className={clsx('error-state', className)} role="alert">
      <span className="error-state__icon">
        <Icon name="alert" size="xl" />
      </span>
      <h2 className="error-state__title">{title}</h2>
      {error?.message && <p className="error-state__message">{error.message}</p>}
      {onRetry && (
        <Button
          variant="secondary"
          iconStart="refresh"
          loading={isRetrying}
          onClick={onRetry}
          className="error-state__retry"
        >
          Reintentar
        </Button>
      )}
    </div>
  )
}
