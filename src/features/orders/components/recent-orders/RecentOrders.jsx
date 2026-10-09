import { Link } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton } from '@/components/feedback'
import { Button, Price } from '@/components/ui'
import { paths } from '@/constants/paths'
import { formatDate } from '@/utils/formatDate'
import { useOrders } from '../../hooks/useOrders'
import { OrderStatusBadge } from '../order-status-badge/OrderStatusBadge'
import './recent-orders.scss'

export function RecentOrders({ limit = 3 }) {
  const query = useOrders({ pageSize: limit })

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton lines={3} />}
      isEmpty={(data) => data.items.length === 0}
      empty={
        <EmptyState
          compact
          icon="bag"
          title="Aún no tienes pedidos"
          description="Cuando compres, aquí verás el estado de cada pedido."
          action={
            <Button as={Link} to={paths.catalog} variant="secondary" size="sm">
              Ver catálogo
            </Button>
          }
        />
      }
      errorTitle="No pudimos cargar tus pedidos"
    >
      {(data) => (
        <ul className="recent-orders" role="list">
          {data.items.map((order) => (
            <li key={order.id} className="recent-orders__item">
              <Link className="recent-orders__number" to={paths.order(order.id)}>
                {order.number}
              </Link>
              <span className="recent-orders__meta">
                {formatDate(order.createdAt)} · {order.summary.itemsCount} unidades
              </span>
              <OrderStatusBadge status={order.status} />
              <Price amount={order.summary.total} size="sm" className="recent-orders__total" />
            </li>
          ))}
        </ul>
      )}
    </QueryBoundary>
  )
}
