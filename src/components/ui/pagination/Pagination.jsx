import { Link } from 'react-router'
import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import { getPageItems } from './getPageItems'
import './pagination.scss'

/**
 * Paginación con enlaces reales (funciona sin JS y se puede abrir en otra pestaña).
 * `getHref(page)` construye la URL de cada página.
 */
export function Pagination({ page, totalPages, getHref, label = 'Paginación', className }) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav className={clsx('pagination', className)} aria-label={label}>
      <ul className="pagination__list" role="list">
        <li>
          {page > 1 ? (
            <Link className="pagination__link pagination__link--nav" to={getHref(page - 1)}>
              <Icon name="chevron-left" size="sm" />
              <span className="pagination__nav-label">Anterior</span>
            </Link>
          ) : (
            <span
              className="pagination__link pagination__link--nav pagination__link--disabled"
              aria-hidden="true"
            >
              <Icon name="chevron-left" size="sm" />
              <span className="pagination__nav-label">Anterior</span>
            </span>
          )}
        </li>

        {items.map((item) =>
          typeof item === 'string' ? (
            <li key={item} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                className={clsx('pagination__link', item === page && 'pagination__link--current')}
                to={getHref(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link className="pagination__link pagination__link--nav" to={getHref(page + 1)}>
              <span className="pagination__nav-label">Siguiente</span>
              <Icon name="chevron-right" size="sm" />
            </Link>
          ) : (
            <span
              className="pagination__link pagination__link--nav pagination__link--disabled"
              aria-hidden="true"
            >
              <span className="pagination__nav-label">Siguiente</span>
              <Icon name="chevron-right" size="sm" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
