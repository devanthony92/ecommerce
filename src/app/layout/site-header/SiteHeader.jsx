import { Link } from 'react-router'
import { Badge, IconButton } from '@/components/ui'
import { Can, useAuth, useRequireAuth } from '@/features/auth'
import { CART_DRAWER_ID, useCart } from '@/features/cart'
import { PERMISSIONS } from '@/constants/permissions'
import { PANELS, useUi } from '@/hooks/useUi'
import { paths } from '@/constants/paths'
import { CategoryNav } from '../category-nav/CategoryNav'
import { HeaderSearch } from '../header-search/HeaderSearch'
import { MOBILE_MENU_ID } from '../mobile-menu/MobileMenu'
import './site-header.scss'

function cartLabel(count) {
  if (count === 0) return 'Carrito vacío'
  return `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`
}

export function SiteHeader() {
  const { isAuthenticated } = useAuth()
  const { itemsCount } = useCart()
  const { open, isOpen } = useUi()
  const requireAuth = useRequireAuth()

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <IconButton
          icon="menu"
          label="Abrir menú"
          className="site-header__menu-button"
          aria-haspopup="dialog"
          aria-expanded={isOpen(PANELS.MOBILE_MENU)}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => open(PANELS.MOBILE_MENU)}
        />

        <Link className="site-header__brand" to={paths.home} aria-label="Trama, ir al inicio">
          Trama
        </Link>

        <HeaderSearch className="site-header__search" />

        <div className="site-header__actions">
          <Can permission={PERMISSIONS.WHOLESALE_ACCESS}>
            <Link className="site-header__wholesale" to={paths.wholesale}>
              <Badge tone="wholesale">Mayorista</Badge>
              <span className="site-header__wholesale-label">Mi panel</span>
            </Link>
          </Can>

          <IconButton
            as={Link}
            // Sin sesión, RequireAuth redirige al login y vuelve aquí.
            to={paths.favorites}
            icon="heart"
            label="Favoritos"
            className="site-header__favorites"
          />
          {isAuthenticated ? (
            <IconButton as={Link} to={paths.account} icon="user" label="Mi cuenta" />
          ) : (
            // Sin sesión: login en modal, sin perder la página actual.
            <IconButton
              icon="user"
              label="Ingresar a mi cuenta"
              aria-haspopup="dialog"
              onClick={() => requireAuth()}
            />
          )}
          <IconButton
            icon="bag"
            label={cartLabel(itemsCount)}
            badge={itemsCount}
            aria-haspopup="dialog"
            aria-expanded={isOpen(PANELS.CART)}
            aria-controls={CART_DRAWER_ID}
            onClick={() => open(PANELS.CART)}
          />
        </div>
      </div>

      <div className="site-header__nav">
        <CategoryNav />
      </div>
    </header>
  )
}
