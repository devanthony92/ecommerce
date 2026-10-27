import { QueryBoundary, Skeleton } from '@/components/feedback'
import { ContentCard } from '@/components/layout'
import { Icon, Price } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { RecentOrders, ReorderButton, useOrders } from '@/features/orders'
import { paths } from '@/constants/paths'
import { formatDate } from '@/utils/formatDate'
import { QuickActions } from '../components/quick-actions/QuickActions'
import { WholesaleSummaryCard } from '../components/wholesale-summary-card/WholesaleSummaryCard'
import { useWholesaleProfile } from '../hooks/useWholesaleRequest'
import './wholesale-dashboard-page.scss'

// "Repetir último pedido" en un clic.
function LastOrderCard() {
  const { data } = useOrders({ pageSize: 1 })
  const last = data?.items[0]
  if (!last) return null

  return (
    <ContentCard title="Último pedido" action={{ to: paths.order(last.id), label: 'Ver detalle' }}>
      <p>
        <strong>{last.number}</strong> · {formatDate(last.createdAt)} · {last.summary.itemsCount}{' '}
        unidades
      </p>
      <Price amount={last.summary.total} />
      <ReorderButton order={last} variant="wholesale" size="md" label="Repetir último pedido" />
    </ContentCard>
  )
}

export default function WholesaleDashboardPage() {
  const { currentUser: user } = useAuth()
  const query = useWholesaleProfile()

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="16rem" />}
      errorTitle="No pudimos cargar tu panel"
    >
      {(profile) => (
        <div className="wholesale-dashboard">
          <WholesaleSummaryCard name={user.name} profile={profile} />
          <QuickActions />

          <div className="wholesale-dashboard__grid">
            <ContentCard
              title="Pedidos recientes"
              action={{ to: paths.orders, label: 'Ver todos' }}
              className="wholesale-dashboard__orders"
            >
              <RecentOrders />
            </ContentCard>

            <LastOrderCard />

            <ContentCard title="Ahorro generado" tone="wholesale">
              <Price amount={profile.totalSavings} size="xl" tone="wholesale" />
              <p className="wholesale-dashboard__muted">
                En {profile.period.from.slice(0, 4)} frente al precio público.
              </p>
            </ContentCard>

            <ContentCard
              title="Tus beneficios"
              action={{ to: paths.benefits, label: 'Ver beneficios' }}
            >
              <ul className="wholesale-dashboard__benefits" role="list">
                {profile.benefits.map((benefit) => (
                  <li key={benefit.code} className="wholesale-dashboard__benefit">
                    <Icon name="check" size="sm" />
                    {benefit.label}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </div>
        </div>
      )}
    </QueryBoundary>
  )
}
