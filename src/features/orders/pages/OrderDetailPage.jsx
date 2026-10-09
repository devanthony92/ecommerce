import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Breadcrumbs, ContentCard } from '@/components/layout'
import { Button, Price, ResponsiveImage } from '@/components/ui'
import { variantLabel } from '@/features/cart'
import { formatAddress } from '@/features/users'
import { paths } from '@/constants/paths'
import { formatDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/formatMoney'
import { CancelOrderModal } from '../components/cancel-order-modal/CancelOrderModal'
import { OrderStatusBadge } from '../components/order-status-badge/OrderStatusBadge'
import { OrderTimeline } from '../components/order-timeline/OrderTimeline'
import { ReorderButton } from '../components/reorder-button/ReorderButton'
import { useOrder } from '../hooks/useOrder'
import './order-detail-page.scss'

function OrderDetail({ order }) {
  const [isCancelling, setIsCancelling] = useState(false)

  return (
    <div className="order-detail">
      <header className="order-detail__header">
        <div className="order-detail__title-row">
          <h1 className="order-detail__title">Pedido {order.number}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="order-detail__date">Realizado el {formatDate(order.createdAt)}</p>
        <div className="order-detail__actions">
          {order.canReorder && <ReorderButton order={order} variant="primary" size="md" />}
          {order.canCancel && (
            <Button variant="ghost" onClick={() => setIsCancelling(true)}>
              Cancelar pedido
            </Button>
          )}
        </div>
      </header>

      <OrderTimeline status={order.status} />
      {order.cancelReason && (
        <p className="order-detail__muted">Motivo de cancelación: {order.cancelReason}</p>
      )}

      <div className="order-detail__grid">
        <ContentCard title="Productos" className="order-detail__items">
          <ul className="order-detail__list" role="list">
            {order.items.map((item) => (
              <li key={item.variant.id} className="order-detail__item">
                <ResponsiveImage src={item.image?.url} alt="" className="order-detail__image" />
                <div className="order-detail__item-info">
                  <Link to={paths.product(item.productSlug)}>{item.name}</Link>
                  <span className="order-detail__muted">
                    {variantLabel(item.variant.attributes)} · {item.quantity} ×{' '}
                    {formatMoney(item.unitPrice)}
                  </span>
                </div>
                <Price amount={item.lineTotal} size="sm" />
              </li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard title="Resumen">
          <dl className="order-detail__rows">
            <div className="order-detail__row">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.summary.subtotal)}</dd>
            </div>
            {order.summary.discountTotal > 0 && (
              <div className="order-detail__row order-detail__row--discount">
                <dt>Descuentos</dt>
                <dd>−{formatMoney(order.summary.discountTotal)}</dd>
              </div>
            )}
            <div className="order-detail__row">
              <dt>Envío</dt>
              <dd>
                {order.summary.shipping === 0 ? 'Gratis' : formatMoney(order.summary.shipping)}
              </dd>
            </div>
            <div className="order-detail__row order-detail__row--total">
              <dt>Total</dt>
              <dd>{formatMoney(order.summary.total)}</dd>
            </div>
          </dl>
        </ContentCard>

        <ContentCard title="Entrega y pago">
          <p>
            {order.address.recipient} · {formatAddress(order.address)}
          </p>
          <p className="order-detail__muted">
            {order.shipping.label} · {order.shipping.estimatedDays}
          </p>
          <p className="order-detail__muted">Pago: {order.payment.label}</p>
        </ContentCard>
      </div>

      {order.canCancel && (
        <CancelOrderModal
          order={order}
          open={isCancelling}
          onClose={() => setIsCancelling(false)}
        />
      )}
    </div>
  )
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const query = useOrder(orderId)

  return (
    <>
      <Breadcrumbs
        items={[
          { to: paths.account, label: 'Mi cuenta' },
          { to: paths.orders, label: 'Pedidos' },
          { label: query.data?.number ?? 'Pedido' },
        ]}
      />
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="20rem" />}
        errorTitle="No encontramos este pedido"
      >
        {(order) => <OrderDetail order={order} />}
      </QueryBoundary>
    </>
  )
}
