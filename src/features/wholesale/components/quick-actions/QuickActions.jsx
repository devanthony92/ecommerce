import { Link } from 'react-router'
import { Icon } from '@/components/ui'
import { paths } from '@/constants/paths'
import './quick-actions.scss'

const ACTIONS = [
  {
    to: paths.quickOrder,
    icon: 'bag',
    label: 'Pedido rápido',
    text: 'Varias referencias a la vez',
  },
  { to: paths.orders, icon: 'refresh', label: 'Repetir pedido', text: 'Desde tu historial' },
  { to: paths.frequentProducts, icon: 'heart', label: 'Mis productos', text: 'Lo que más compras' },
  {
    to: paths.wholesaleCatalog,
    icon: 'search',
    label: 'Precios mayoristas',
    text: 'Todo el catálogo',
  },
]

export function QuickActions() {
  return (
    <nav className="quick-actions" aria-label="Accesos rápidos">
      <ul className="quick-actions__list" role="list">
        {ACTIONS.map((action) => (
          <li key={action.to}>
            <Link className="quick-actions__link" to={action.to}>
              <Icon name={action.icon} className="quick-actions__icon" />
              <span className="quick-actions__label">{action.label}</span>
              <span className="quick-actions__text">{action.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
