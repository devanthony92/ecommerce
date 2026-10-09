import { Link } from 'react-router'
import { Drawer } from '@/components/drawer'
import { EmptyState, QueryBoundary, Skeleton } from '@/components/feedback'
import { Button, Price } from '@/components/ui'
import { paths } from '@/constants/paths'
import { PANELS, useUi } from '@/hooks/useUi'
import { useCart } from '../../hooks/useCart'
import { CartIncentives } from '../cart-incentives/CartIncentives'
import { CartItem } from '../cart-item/CartItem'
import { MinimumOrderNotice } from '../minimum-order-notice/MinimumOrderNotice'
import './cart-drawer.scss'

export const CART_DRAWER_ID = 'cart-drawer'

export function CartDrawer() {
  const { isOpen, close } = useUi()
  const { cart, query, itemsCount } = useCart()
  const hasItems = itemsCount > 0 && cart?.items.length > 0
  const isBelowMinimum = Boolean(cart?.minimumOrder && !cart.minimumOrder.met)

  return (
    <Drawer
      id={CART_DRAWER_ID}
      className="cart-drawer"
      open={isOpen(PANELS.CART)}
      onClose={close}
      title="Mi carrito"
      footer={
        hasItems && (
          <>
            <p className="cart-drawer__total">
              <span>Total</span>
              <Price amount={cart.summary.total} size="lg" />
            </p>
            <MinimumOrderNotice minimumOrder={cart.minimumOrder} />
            {isBelowMinimum ? (
              <Button block disabled>
                Finalizar compra
              </Button>
            ) : (
              <Button as={Link} to={paths.checkout} block>
                Finalizar compra
              </Button>
            )}
            <Button as={Link} to={paths.cart} variant="secondary" block>
              Ver carrito
            </Button>
          </>
        )
      }
    >
      <QueryBoundary
        query={query}
        loading={<Skeleton lines={4} />}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            compact
            icon="bag"
            title="Tu carrito está vacío"
            description="Explora el catálogo y encuentra tu próxima prenda."
            action={
              <Button as={Link} to={paths.catalog} variant="secondary">
                Ver catálogo
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tu carrito"
      >
        {(data) => (
          <div className="cart-drawer__content">
            <CartIncentives incentives={data.incentives} limit={1} />
            <ul className="cart-drawer__list" role="list">
              {data.items.map((item) => (
                <li key={item.id}>
                  <CartItem item={item} compact />
                </li>
              ))}
            </ul>
          </div>
        )}
      </QueryBoundary>
    </Drawer>
  )
}
