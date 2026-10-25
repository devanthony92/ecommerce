import './page-header.scss'

// `viewTransitionName`: el título es el destino de una View Transition (p. ej. la
// tarjeta de categoría de la home que se convierte en este encabezado).
export function PageHeader({ title, description, viewTransitionName }) {
  return (
    <header className="page-header">
      <h1 className="page-header__title" style={viewTransitionName && { viewTransitionName }}>
        {title}
      </h1>
      {description && <p className="page-header__description">{description}</p>}
    </header>
  )
}
