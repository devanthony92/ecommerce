import { Link } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui'
import { paths } from '@/constants/paths'
import { CartIncentives } from '../components/cart-incentives/CartIncentives'
import { CartItem } from '../components/cart-item/CartItem'
import { CartSummary } from '../components/cart-summary/CartSummary'
import { CartWarnings } from '../components/cart-warnings/CartWarnings'
import { useCart } from '../hooks/useCart'
import './cart-page.scss'

function CartSkeleton() {
  return (
    <div className="cart-page__layout" aria-busy="true" aria-label="Cargando carrito">
      <div className="cart-page__items">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} variant="rect" height="7rem" />
        ))}
      </div>
      <Skeleton variant="rect" height="16rem" />
    </div>
  )
}

export default function CartPage() {
  const { query, isUpdating } = useCart()

  return (
    <div className="cart-page">
      <PageHeader title="Carrito" />
      <QueryBoundary
        query={query}
        loading={<CartSkeleton />}
        isEmpty={(cart) => cart.items.length === 0}
        empty={
          <EmptyState
            icon="bag"
            title="Tu carrito está vacío"
            description="Compra por unidad o aprovecha los precios por volumen."
            action={
              <Button as={Link} to={paths.catalog}>
                Ver catálogo
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tu carrito"
      >
        {(cart) => (
          <div className="cart-page__layout">
            <div className="cart-page__items" aria-busy={isUpdating || undefined}>
              <CartWarnings warnings={cart.warnings} />
              <CartIncentives incentives={cart.incentives} />
              <ul className="cart-page__list" role="list" aria-label="Productos en el carrito">
                {cart.items.map((item) => (
                  <li key={item.id}>
                    <CartItem item={item} headingLevel={2} />
                  </li>
                ))}
              </ul>
              <Link className="cart-page__continue" to={paths.catalog}>
                Seguir comprando
              </Link>
            </div>
            <CartSummary summary={cart.summary} className="cart-page__summary" />
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
