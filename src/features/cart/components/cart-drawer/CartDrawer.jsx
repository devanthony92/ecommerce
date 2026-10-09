import { Link } from 'react-router'
import { Drawer } from '@/components/drawer'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { PANELS, useUi } from '@/hooks/useUi'
import { paths } from '@/constants/paths'
import { useCart } from '../../hooks/useCart'
import './cart-drawer.scss'

export const CART_DRAWER_ID = 'cart-drawer'

// Fase 3: estructura y estados. Ítems con precio, incentivos y subtotal llegan en la fase 6.
export function CartDrawer() {
  const { isOpen, close } = useUi()
  const { itemsCount } = useCart()
  const isEmpty = itemsCount === 0

  return (
    <Drawer
      id={CART_DRAWER_ID}
      className="cart-drawer"
      open={isOpen(PANELS.CART)}
      onClose={close}
      title="Mi carrito"
      footer={
        !isEmpty && (
          <Button as={Link} to={paths.cart} block>
            Ver carrito
          </Button>
        )
      }
    >
      {isEmpty ? (
        <EmptyState
          icon="bag"
          title="Tu carrito está vacío"
          description="Explora el catálogo y aprovecha los precios por volumen."
          action={
            <Button as={Link} to={paths.catalog} variant="secondary">
              Ver catálogo
            </Button>
          }
        />
      ) : (
        <p className="cart-drawer__summary">
          Tienes {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'} en el carrito.
        </p>
      )}
    </Drawer>
  )
}
