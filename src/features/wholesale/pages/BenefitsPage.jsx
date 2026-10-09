import { QueryBoundary, Skeleton } from '@/components/feedback'
import { ContentCard, PageHeader } from '@/components/layout'
import { LevelCards } from '../components/level-cards/LevelCards'
import { WholesaleProgress } from '../components/wholesale-progress/WholesaleProgress'
import { useWholesaleProfile } from '../hooks/useWholesaleRequest'
import './benefits-page.scss'

export default function BenefitsPage() {
  const query = useWholesaleProfile()

  return (
    <div className="benefits-page">
      <PageHeader
        title="Beneficios y niveles"
        description="Tu nivel se calcula con tus compras del año y nunca baja durante el año."
      />
      <QueryBoundary query={query} loading={<Skeleton variant="rect" height="14rem" />}>
        {(profile) => (
          <>
            <ContentCard title={`Tu nivel: ${profile.currentLevel.name}`} tone="wholesale">
              <WholesaleProgress profile={profile} />
            </ContentCard>
            <LevelCards currentCode={profile.currentLevel.code} />
          </>
        )}
      </QueryBoundary>
    </div>
  )
}
