import { Link, useParams } from 'react-router'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Button, Icon, Price } from '@/components/ui'
import { variantLabel } from '@/features/cart'
import { formatAddress } from '@/features/users'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { OrderStatusBadge } from '../components/order-status-badge/OrderStatusBadge'
import { useOrder } from '../hooks/useOrder'
import './order-confirmation-page.scss'

function Confirmation({ order }) {
  return (
    <div className="order-confirmation">
      <header className="order-confirmation__header">
        <span className="order-confirmation__icon">
          <Icon name="check" size="xl" />
        </span>
        <h1 className="order-confirmation__title">¡Gracias por tu compra!</h1>
        <p className="order-confirmation__number">
          Pedido <strong>{order.number}</strong> <OrderStatusBadge status={order.status} />
        </p>
      </header>

      <section className="order-confirmation__section" aria-labelledby="confirmation-delivery">
        <h2 className="order-confirmation__subtitle" id="confirmation-delivery">
          Entrega
        </h2>
        <p>
          {order.address.recipient} · {formatAddress(order.address)}
        </p>
        <p className="order-confirmation__muted">
          {order.shipping.label} · {order.shipping.estimatedDays}
        </p>
        <p className="order-confirmation__muted">Pago: {order.payment.label}</p>
      </section>

      <section className="order-confirmation__section" aria-labelledby="confirmation-items">
        <h2 className="order-confirmation__subtitle" id="confirmation-items">
          Productos
        </h2>
        <ul className="order-confirmation__items" role="list">
          {order.items.map((item) => (
            <li key={item.variant.id} className="order-confirmation__item">
              <span>
                {item.name}
                <span className="order-confirmation__muted">
                  {' '}
                  · {variantLabel(item.variant.attributes)} × {item.quantity}
                </span>
              </span>
              <Price amount={item.lineTotal} size="sm" />
            </li>
          ))}
        </ul>
        <dl className="order-confirmation__totals">
          {order.summary.discountTotal > 0 && (
            <div className="order-confirmation__total-row">
              <dt>Ahorraste</dt>
              <dd>{formatMoney(order.summary.discountTotal)}</dd>
            </div>
          )}
          <div className="order-confirmation__total-row">
            <dt>Envío</dt>
            <dd>{order.summary.shipping === 0 ? 'Gratis' : formatMoney(order.summary.shipping)}</dd>
          </div>
          <div className="order-confirmation__total-row order-confirmation__total-row--grand">
            <dt>Total</dt>
            <dd>
              <Price amount={order.summary.total} size="lg" />
            </dd>
          </div>
        </dl>
      </section>

      <div className="order-confirmation__actions">
        <Button as={Link} to={paths.orders} variant="secondary">
          Ver mis pedidos
        </Button>
        <Button as={Link} to={paths.catalog}>
          Seguir comprando
        </Button>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const query = useOrder(orderId)

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="20rem" />}
      errorTitle="No encontramos este pedido"
    >
      {(order) => <Confirmation order={order} />}
    </QueryBoundary>
  )
}
