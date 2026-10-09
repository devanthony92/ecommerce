import { Link, useSearchParams } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button, Pagination } from '@/components/ui'
import { paths } from '@/constants/paths'
import { OrderCard } from '../components/order-card/OrderCard'
import { useOrders } from '../hooks/useOrders'
import './orders-page.scss'

const GROUPS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'En curso' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const hrefFor = (group, page) => {
  const params = new URLSearchParams()
  if (group) params.set('group', group)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `?${query}` : '?'
}

export default function OrdersPage() {
  const [searchParams] = useSearchParams()
  const group = GROUPS.some((item) => item.value === searchParams.get('group'))
    ? searchParams.get('group')
    : ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const query = useOrders({ group: group || undefined, page })

  return (
    <div className="orders-page">
      <PageHeader title="Pedidos" description="Sigue tus pedidos y repite compras en un clic." />

      <nav className="orders-page__filters" aria-label="Filtrar pedidos">
        {GROUPS.map((item) => (
          <Link
            key={item.value}
            to={hrefFor(item.value, 1)}
            className="orders-page__filter"
            aria-current={item.value === group ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="12rem" />}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="bag"
            title={group ? 'No hay pedidos con este filtro' : 'Aún no tienes pedidos'}
            action={
              <Button as={Link} to={paths.catalog} variant="secondary">
                Ver catálogo
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tus pedidos"
      >
        {(data) => (
          <>
            <ul
              className="orders-page__list"
              role="list"
              aria-busy={query.isPlaceholderData || undefined}
            >
              {data.items.map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} />
                </li>
              ))}
            </ul>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              getHref={(target) => hrefFor(group, target)}
              label="Páginas de pedidos"
            />
          </>
        )}
      </QueryBoundary>
    </div>
  )
}
