import { Link, useParams, useSearchParams } from 'react-router'
import clsx from 'clsx'
import { QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { Button, Icon, Price } from '@/components/ui'
import { variantLabel } from '@/features/cart'
import { formatAddress } from '@/features/users'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { redirectTo } from '@/utils/redirect'
import { OrderStatusBadge } from '../components/order-status-badge/OrderStatusBadge'
import { usePayOrder } from '../hooks/useOrderActions'
import { useOrder } from '../hooks/useOrder'
import './order-confirmation-page.scss'

/**
 * Pedido sin pagar. El estado real lo da el backend (webhook de Mercado Pago);
 * `paymentStatus` es el `?status=` con el que Mercado Pago devuelve al usuario.
 */
function PendingPayment({ order, paymentStatus }) {
  const toast = useToast()
  const pay = usePayOrder()

  async function handlePay() {
    try {
      const { redirectUrl } = await pay.mutateAsync(order.id)
      redirectTo(redirectUrl)
    } catch (error) {
      toast.show({
        tone: 'danger',
        title: 'No pudimos iniciar el pago',
        description: error.message,
      })
    }
  }

  return (
    <div className="order-confirmation__pending" role="status">
      <p>
        {paymentStatus === 'rejected'
          ? 'Mercado Pago rechazó el pago. Puedes intentarlo de nuevo con otro medio.'
          : 'Si ya pagaste, la confirmación de Mercado Pago puede tardar unos minutos.'}
      </p>
      {order.payment.method === 'MERCADO_PAGO' && (
        <Button loading={pay.isPending} onClick={handlePay}>
          Pagar con Mercado Pago
        </Button>
      )}
    </div>
  )
}

function Confirmation({ order, paymentStatus }) {
  const isPending = order.status === 'PENDING_PAYMENT'

  return (
    <div className="order-confirmation">
      <header className="order-confirmation__header">
        <span
          className={clsx(
            'order-confirmation__icon',
            isPending && 'order-confirmation__icon--pending',
          )}
        >
          <Icon name={isPending ? 'info' : 'check'} size="xl" />
        </span>
        <h1 className="order-confirmation__title">
          {isPending ? 'Tu pedido está pendiente de pago' : '¡Gracias por tu compra!'}
        </h1>
        <p className="order-confirmation__number">
          Pedido <strong>{order.number}</strong> <OrderStatusBadge status={order.status} />
        </p>
      </header>

      {isPending && <PendingPayment order={order} paymentStatus={paymentStatus} />}

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
  const [searchParams] = useSearchParams()

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="20rem" />}
      errorTitle="No encontramos este pedido"
    >
      {(order) => <Confirmation order={order} paymentStatus={searchParams.get('status')} />}
    </QueryBoundary>
  )
}
