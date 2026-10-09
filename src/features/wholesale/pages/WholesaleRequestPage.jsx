import { useState } from 'react'
import { Link } from 'react-router'
import { QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { ContentCard, PageHeader } from '@/components/layout'
import { Badge, Button } from '@/components/ui'
import { useCategories } from '@/features/catalog'
import { paths } from '@/constants/paths'
import { WHOLESALE_REQUEST_STATUS } from '@/constants/statuses'
import { BUSINESS_TYPES, MONTHLY_VOLUMES, labelOf } from '../constants'
import { DevReviewPanel } from '../components/dev-review-panel/DevReviewPanel'
import { LevelCards } from '../components/level-cards/LevelCards'
import { RequestTimeline } from '../components/request-timeline/RequestTimeline'
import { WholesaleRequestForm } from '../components/wholesale-request-form/WholesaleRequestForm'
import { useSubmitWholesaleRequest, useWholesaleRequest } from '../hooks/useWholesaleRequest'
import './wholesale-request-page.scss'

const MESSAGES = {
  PENDING: 'Recibimos tu solicitud. Un asesor la revisará en máximo 2 días hábiles.',
  UNDER_REVIEW: 'Estamos verificando los datos de tu negocio. Te avisaremos por correo.',
  APPROVED: 'Ya tienes acceso a precios mayoristas en todo el catálogo.',
  SUSPENDED:
    'Tu cuenta mayorista está suspendida. Escríbenos a mayoristas@trama.test para revisarla.',
}

function RequestSummary({ data }) {
  const { data: categories = [] } = useCategories()
  const categoryNames = data.categoriesOfInterest
    .map((id) => categories.find((category) => category.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  const rows = [
    ['Negocio', `${data.tradeName} · ${data.legalName}`],
    ['NIT o cédula', data.nit],
    ['Tipo', labelOf(BUSINESS_TYPES, data.businessType)],
    ['Contacto', `${data.phone} · ${data.city}`],
    ['Volumen mensual', labelOf(MONTHLY_VOLUMES, data.estimatedMonthlyVolume)],
    ['Categorías', categoryNames],
  ]

  return (
    <dl className="wholesale-request-page__summary">
      {rows.map(([label, value]) => (
        <div key={label} className="wholesale-request-page__row">
          <dt className="wholesale-request-page__label">{label}</dt>
          <dd className="wholesale-request-page__value">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RequestStatus({ request, onResubmit }) {
  const status = WHOLESALE_REQUEST_STATUS[request.status]

  return (
    <div className="wholesale-request-page__status">
      <ContentCard
        title="Tu solicitud"
        tone={request.status === 'APPROVED' ? 'wholesale' : 'default'}
      >
        <p>
          Estado: <Badge tone={status.badge}>{status.label}</Badge>
        </p>
        {request.status === 'REJECTED' ? (
          <p className="wholesale-request-page__reason" role="status">
            Motivo: {request.rejectionReason}
          </p>
        ) : (
          <p>{MESSAGES[request.status]}</p>
        )}
        {request.status === 'APPROVED' && (
          <Button as={Link} to={paths.wholesale} variant="wholesale">
            Ir a mi panel mayorista
          </Button>
        )}
        {request.status === 'REJECTED' && (
          <Button variant="secondary" onClick={onResubmit}>
            Enviar nueva solicitud
          </Button>
        )}
        <RequestTimeline request={request} />
      </ContentCard>

      <ContentCard title="Datos enviados">
        <RequestSummary data={request.data} />
      </ContentCard>

      <DevReviewPanel currentStatus={request.status} />
    </div>
  )
}

export default function WholesaleRequestPage() {
  const toast = useToast()
  const query = useWholesaleRequest()
  const submit = useSubmitWholesaleRequest()
  const [isResubmitting, setIsResubmitting] = useState(false)

  async function handleSubmit(values) {
    await submit.mutateAsync(values)
    setIsResubmitting(false)
    window.scrollTo(0, 0)
    toast.show({ tone: 'success', title: 'Solicitud enviada' })
  }

  return (
    <div className="wholesale-request-page">
      <PageHeader
        title="Cuenta mayorista"
        description="Precios especiales por nivel para tiendas y revendedores."
      />
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="16rem" />}
        errorTitle="No pudimos cargar tu solicitud"
      >
        {(request) =>
          request && !isResubmitting ? (
            <RequestStatus request={request} onResubmit={() => setIsResubmitting(true)} />
          ) : (
            <div className="wholesale-request-page__apply">
              <section aria-labelledby="levels-title" className="wholesale-request-page__levels">
                <h2 id="levels-title">Niveles y descuentos</h2>
                <p className="wholesale-request-page__muted">
                  Empiezas en Bronce y subes de nivel según tus compras del año.
                </p>
                <LevelCards />
              </section>
              <ContentCard title="Solicitud">
                <WholesaleRequestForm
                  initialValues={isResubmitting ? request?.data : undefined}
                  onSubmit={handleSubmit}
                />
              </ContentCard>
            </div>
          )
        }
      </QueryBoundary>
    </div>
  )
}
