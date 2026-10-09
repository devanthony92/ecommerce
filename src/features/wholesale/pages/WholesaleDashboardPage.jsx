import { QueryBoundary, Skeleton } from '@/components/feedback'
import { ContentCard } from '@/components/layout'
import { Icon, Price } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { RecentOrders } from '@/features/orders'
import { paths } from '@/constants/paths'
import { QuickActions } from '../components/quick-actions/QuickActions'
import { WholesaleLevelCard } from '../components/wholesale-level-card/WholesaleLevelCard'
import { useWholesaleProfile } from '../hooks/useWholesaleRequest'
import './wholesale-dashboard-page.scss'

export default function WholesaleDashboardPage() {
  const { user } = useAuth()
  const query = useWholesaleProfile()

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="16rem" />}
      errorTitle="No pudimos cargar tu panel"
    >
      {(profile) => (
        <div className="wholesale-dashboard">
          <WholesaleLevelCard name={user.name} profile={profile} />
          <QuickActions />

          <div className="wholesale-dashboard__grid">
            <ContentCard
              title="Pedidos recientes"
              action={{ to: paths.orders, label: 'Ver todos' }}
              className="wholesale-dashboard__orders"
            >
              <RecentOrders />
            </ContentCard>

            <ContentCard title="Ahorro generado" tone="wholesale">
              <Price amount={profile.totalSavings} size="xl" tone="wholesale" />
              <p className="wholesale-dashboard__muted">
                En {profile.period.from.slice(0, 4)} frente al precio público.
              </p>
            </ContentCard>

            <ContentCard
              title="Tus beneficios"
              action={{ to: paths.benefits, label: 'Ver niveles' }}
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
