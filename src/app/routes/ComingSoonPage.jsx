import { EmptyState } from '@/components/feedback'
import { PageHeader } from '@/components/layout'

// Marcador para rutas ya definidas cuya página llega en una fase posterior.
export default function ComingSoonPage({ title, phase }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon="info"
        title="Sección en construcción"
        description={`Esta página se implementa en la fase ${phase}.`}
      />
    </>
  )
}
