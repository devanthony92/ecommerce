import clsx from 'clsx'
import { Spinner } from '@/components/ui'
import './loading-state.scss'

// `page`: ocupa el alto de una página (fallback de Suspense / sesión).
export function LoadingState({ label = 'Cargando…', page = false, className }) {
  return (
    <div
      className={clsx('loading-state', page && 'loading-state--page', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" className="loading-state__spinner" />
      <span className="loading-state__label">{label}</span>
    </div>
  )
}
