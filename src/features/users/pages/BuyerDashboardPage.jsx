import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/features/auth'

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  return (
    <PageHeader
      title={`Hola, ${user.name}`}
      description="Dashboard de comprador: llega en la fase 9."
    />
  )
}
