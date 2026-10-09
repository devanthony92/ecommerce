import { PageHeader } from '@/components/layout'
import { useAuth } from '@/features/auth'

export default function WholesaleDashboardPage() {
  const { user } = useAuth()
  return (
    <PageHeader
      title={`Panel mayorista · ${user.name}`}
      description="Nivel, progreso y pedidos rápidos: llega en la fase 11."
    />
  )
}
