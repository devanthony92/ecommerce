import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LoadingState, RouteErrorBoundary } from '@/components/feedback'
import { CartDrawer } from '@/features/cart'
import { MobileMenu } from '../mobile-menu/MobileMenu'
import { SiteFooter } from '../site-footer/SiteFooter'
import { SiteHeader } from '../site-header/SiteHeader'
import './main-layout.scss'

// Al cambiar de página: scroll arriba y foco en el contenido principal,
// para que teclado y lectores de pantalla empiecen en la nueva página.
function useRouteChangeFocus(mainRef) {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname, mainRef])
}

export function MainLayout() {
  const mainRef = useRef(null)
  const { pathname } = useLocation()
  useRouteChangeFocus(mainRef)

  return (
    <div className="main-layout">
      <a className="main-layout__skip-link" href="#main-content">
        Saltar al contenido
      </a>

      <SiteHeader />

      <main id="main-content" ref={mainRef} className="main-layout__main" tabIndex={-1}>
        {/* key: un error en una página no bloquea la navegación a otras. */}
        <RouteErrorBoundary key={pathname}>
          <Suspense fallback={<LoadingState page />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <SiteFooter />
      <MobileMenu />
      <CartDrawer />
    </div>
  )
}
