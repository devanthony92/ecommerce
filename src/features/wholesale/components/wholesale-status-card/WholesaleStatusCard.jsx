import { Link } from 'react-router'
import { ContentCard } from '@/components/layout'
import { Badge, Button } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import { WHOLESALE_REQUEST_STATUS } from '@/constants/statuses'

const MESSAGES = {
  PENDING: 'Recibimos tu solicitud. La revisaremos pronto.',
  UNDER_REVIEW: 'Estamos revisando tu solicitud. Te avisaremos por correo.',
  REJECTED: 'Tu solicitud no fue aprobada. Puedes revisar el motivo y enviar una nueva.',
  SUSPENDED: 'Tu cuenta mayorista está suspendida. Escríbenos para revisarla.',
}

// Estado del programa mayorista en la cuenta del comprador (lo define el backend).
export function WholesaleStatusCard() {
  const { user } = useAuth()
  const status = user.wholesale?.requestStatus
  if (status === 'APPROVED') return null

  return (
    <ContentCard title="Precios mayoristas" tone="wholesale">
      {status ? (
        <>
          <p>
            Estado de tu solicitud:{' '}
            <Badge tone={WHOLESALE_REQUEST_STATUS[status].badge}>
              {WHOLESALE_REQUEST_STATUS[status].label}
            </Badge>
          </p>
          <p>{MESSAGES[status]}</p>
          <Button as={Link} to={paths.wholesaleRequest} variant="secondary" size="sm">
            Ver solicitud
          </Button>
        </>
      ) : (
        <>
          <p>
            ¿Tienes una tienda o revendes ropa? Solicita tu cuenta mayorista y accede a precios
            especiales por nivel.
          </p>
          <Button as={Link} to={paths.wholesaleRequest} variant="wholesale" size="sm">
            Solicitar cuenta mayorista
          </Button>
        </>
      )}
    </ContentCard>
  )
}
