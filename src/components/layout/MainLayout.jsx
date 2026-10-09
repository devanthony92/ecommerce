import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { paths } from '@/app/routes/paths'
import { Can, useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { PERMISSIONS } from '@/constants/permissions'
import { PageLoader } from '@/components/feedback/PageLoader'
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary'
import './main-layout.scss'

const CURRENT_YEAR = new Date().getFullYear()

// Layout provisional: Header, Footer y MobileMenu definitivos llegan en la fase 3.
export function MainLayout() {
  const { isAuthenticated, logout } = useAuth()
  const { itemsCount } = useCart()

  const navClass = ({ isActive }) =>
    isActive ? 'main-layout__link main-layout__link--active' : 'main-layout__link'

  return (
    <div className="main-layout">
      <a className="main-layout__skip-link" href="#main-content">
        Saltar al contenido
      </a>

      <header className="main-layout__header">
        <div className="main-layout__bar">
          <Link className="main-layout__brand" to={paths.home}>
            Trama
          </Link>

          <nav className="main-layout__nav" aria-label="Principal">
            <NavLink className={navClass} to={paths.catalog}>
              Catálogo
            </NavLink>
            <Can permission={PERMISSIONS.WHOLESALE_ACCESS}>
              <NavLink className={navClass} to={paths.wholesale}>
                Mayorista
              </NavLink>
            </Can>
            <NavLink className={navClass} to={paths.cart}>
              Carrito ({itemsCount})
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink className={navClass} to={paths.account} end>
                  Mi cuenta
                </NavLink>
                <button type="button" className="main-layout__link" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <NavLink className={navClass} to={paths.login}>
                Ingresar
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="main-layout__main" tabIndex={-1}>
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <footer className="main-layout__footer">
        <p className="main-layout__copyright">© {CURRENT_YEAR} Trama</p>
      </footer>
    </div>
  )
}
