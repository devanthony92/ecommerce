import { Link } from 'react-router'
import { Button, Price, ResponsiveImage } from '@/components/ui'
import { paths } from '@/constants/paths'
import { formatDate } from '@/utils/formatDate'
import { OrderStatusBadge } from '../order-status-badge/OrderStatusBadge'
import { ReorderButton } from '../reorder-button/ReorderButton'
import './order-card.scss'

const MAX_THUMBS = 4

export function OrderCard({ order }) {
  const extra = order.items.length - MAX_THUMBS

  return (
    <article className="order-card">
      <header className="order-card__header">
        <h2 className="order-card__number">
          <Link className="order-card__link" to={paths.order(order.id)}>
            {order.number}
          </Link>
        </h2>
        <OrderStatusBadge status={order.status} />
      </header>

      <p className="order-card__meta">
        {formatDate(order.createdAt)} · {order.summary.itemsCount} unidades
      </p>

      {order.items.length > 0 && (
        <ul className="order-card__thumbs" aria-hidden="true">
          {order.items.slice(0, MAX_THUMBS).map((item) => (
            <li key={item.variant.id} className="order-card__thumb">
              <ResponsiveImage src={item.image?.url} alt="" />
            </li>
          ))}
          {extra > 0 && <li className="order-card__more">+{extra}</li>}
        </ul>
      )}

      <footer className="order-card__footer">
        <Price amount={order.summary.total} srLabel="Total" />
        <div className="order-card__actions">
          <Button as={Link} to={paths.order(order.id)} variant="ghost" size="sm">
            Ver detalle
          </Button>
          {order.canReorder && <ReorderButton order={order} />}
        </div>
      </footer>
    </article>
  )
}
