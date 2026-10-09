import { Link } from 'react-router'
import clsx from 'clsx'
import './breadcrumbs.scss'

// items: [{ to, label }]. El último es la página actual (sin enlace).
export function Breadcrumbs({ items, className }) {
  return (
    <nav className={clsx('breadcrumbs', className)} aria-label="Ruta de navegación">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <li key={item.label} className="breadcrumbs__item">
              {isCurrent ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link className="breadcrumbs__link" to={item.to}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
