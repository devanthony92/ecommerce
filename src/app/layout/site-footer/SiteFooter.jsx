import { Link } from 'react-router'
import { Icon } from '@/components/ui'
import { paths } from '@/constants/paths'
import './site-footer.scss'

const CURRENT_YEAR = new Date().getFullYear()

const COLUMNS = [
  {
    title: 'Comprar',
    // Nombre del landmark distinto a la navegación principal y a la de la cuenta.
    navLabel: 'Enlaces de compra',
    links: [
      { to: paths.catalog, label: 'Catálogo' },
      { to: paths.promotions, label: 'Ofertas' },
      { to: paths.inspiration, label: 'Inspiración' },
      { to: paths.wholesaleLanding, label: 'Compra por mayor' },
    ],
  },
  {
    title: 'Mi cuenta',
    navLabel: 'Enlaces de la cuenta',
    links: [
      { to: paths.account, label: 'Resumen' },
      { to: paths.orders, label: 'Pedidos' },
      { to: paths.favorites, label: 'Favoritos' },
    ],
  },
]

const BENEFITS = [
  { icon: 'bag', label: 'Envíos a todo el país' },
  { icon: 'check', label: 'Pago seguro' },
  { icon: 'refresh', label: 'Cambios y garantía' },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to={paths.home}>
            Trama
          </Link>
          <p className="site-footer__tagline">
            Ropa al detal y por mayor. Compra una unidad o surte tu tienda con precios por volumen.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} className="site-footer__column" aria-label={column.navLabel}>
            <h2 className="site-footer__heading">{column.title}</h2>
            <ul className="site-footer__list" role="list">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link className="site-footer__link" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="site-footer__column">
          <h2 className="site-footer__heading">Compra tranquilo</h2>
          <ul className="site-footer__list" role="list">
            {BENEFITS.map((benefit) => (
              <li key={benefit.label} className="site-footer__benefit">
                <Icon name={benefit.icon} size="sm" />
                {benefit.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="site-footer__copyright">© {CURRENT_YEAR} Trama. Proyecto de portafolio.</p>
    </footer>
  )
}
