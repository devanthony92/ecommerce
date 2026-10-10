import { Link, NavLink } from 'react-router'
import clsx from 'clsx'
import { Drawer } from '@/components/drawer'
import { Skeleton } from '@/components/feedback'
import { Button } from '@/components/ui'
import { Can, useAuth } from '@/features/auth'
import { useCategories } from '@/features/catalog'
import { PERMISSIONS } from '@/constants/permissions'
import { PANELS, useUi } from '@/hooks/useUi'
import { paths } from '@/constants/paths'
import './mobile-menu.scss'

export const MOBILE_MENU_ID = 'mobile-menu'

const linkClass = ({ isActive }) =>
  clsx('mobile-menu__link', isActive && 'mobile-menu__link--active')

function MenuSection({ title, children }) {
  return (
    <section className="mobile-menu__section">
      <h3 className="mobile-menu__heading">{title}</h3>
      <ul className="mobile-menu__list" role="list">
        {children}
      </ul>
    </section>
  )
}

export function MobileMenu() {
  const { isOpen, close } = useUi()
  const { isAuthenticated, logout } = useAuth()
  const { data: categories, isPending } = useCategories()

  return (
    <Drawer
      id={MOBILE_MENU_ID}
      open={isOpen(PANELS.MOBILE_MENU)}
      onClose={close}
      position="left"
      size="sm"
      title="Menú"
      footer={
        isAuthenticated ? (
          <Button variant="secondary" block onClick={logout}>
            Cerrar sesión
          </Button>
        ) : (
          // El footer del Drawer ya apila los botones.
          <>
            <Button as={Link} to={paths.login} block>
              Ingresar
            </Button>
            <Button as={Link} to={paths.register} variant="secondary" block>
              Crear cuenta
            </Button>
          </>
        )
      }
    >
      <nav className="mobile-menu" aria-label="Menú principal">
        <MenuSection title="Comprar">
          <li>
            <NavLink className={linkClass} to={paths.catalog} end>
              Todo el catálogo
            </NavLink>
          </li>
          {isPending && (
            <li className="mobile-menu__placeholder">
              <Skeleton lines={3} />
            </li>
          )}
          {categories?.map((category) => (
            <li key={category.id}>
              <NavLink className={linkClass} to={paths.category(category.slug)}>
                {category.name}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink className={linkClass} to={paths.promotions}>
              Ofertas
            </NavLink>
          </li>
          <li>
            <NavLink className={linkClass} to={paths.inspiration}>
              Inspiración
            </NavLink>
          </li>
        </MenuSection>

        {isAuthenticated && (
          <MenuSection title="Mi cuenta">
            <li>
              <NavLink className={linkClass} to={paths.account} end>
                Resumen
              </NavLink>
            </li>
            <li>
              <NavLink className={linkClass} to={paths.orders}>
                Pedidos
              </NavLink>
            </li>
            <li>
              <NavLink className={linkClass} to={paths.favorites}>
                Favoritos
              </NavLink>
            </li>
            <li>
              <NavLink className={linkClass} to={paths.lists}>
                Listas de compra
              </NavLink>
            </li>
          </MenuSection>
        )}

        <Can
          permission={PERMISSIONS.WHOLESALE_ACCESS}
          fallback={
            <Link className="mobile-menu__cta" to={paths.wholesaleLanding}>
              <span className="mobile-menu__cta-title">¿Revendes nuestros productos?</span>
              <span className="mobile-menu__cta-text">Conoce los precios por volumen.</span>
            </Link>
          }
        >
          <MenuSection title="Mayorista">
            <li>
              <NavLink className={linkClass} to={paths.wholesale} end>
                Panel mayorista
              </NavLink>
            </li>
            <li>
              <NavLink className={linkClass} to={paths.quickOrder}>
                Pedido rápido
              </NavLink>
            </li>
            <li>
              <NavLink className={linkClass} to={paths.frequentProducts}>
                Productos frecuentes
              </NavLink>
            </li>
          </MenuSection>
        </Can>
      </nav>
    </Drawer>
  )
}
