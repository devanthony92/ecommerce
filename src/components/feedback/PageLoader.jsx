import './page-loader.scss'

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span className="page-loader__label">{label}</span>
    </div>
  )
}
