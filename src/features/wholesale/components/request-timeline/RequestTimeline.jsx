import clsx from 'clsx'
import { Icon } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import './request-timeline.scss'

// Pasos visibles del flujo según el estado que devuelve el backend.
function stepsFor(request) {
  const decided = ['APPROVED', 'REJECTED', 'SUSPENDED'].includes(request.status)
  const decisionLabel = {
    APPROVED: 'Aprobada',
    REJECTED: 'No aprobada',
    SUSPENDED: 'Suspendida',
  }[request.status]

  return [
    { label: 'Solicitud enviada', detail: formatDate(request.submittedAt), state: 'done' },
    {
      label: 'Revisión',
      detail: request.status === 'UNDER_REVIEW' ? 'En curso' : null,
      state: decided ? 'done' : request.status === 'UNDER_REVIEW' ? 'current' : 'upcoming',
    },
    {
      label: decisionLabel ?? 'Decisión',
      detail: request.reviewedAt ? formatDate(request.reviewedAt) : 'Te avisaremos por correo',
      state: decided ? (request.status === 'APPROVED' ? 'done' : 'failed') : 'upcoming',
    },
  ]
}

const ICONS = { done: 'check', failed: 'alert', current: 'refresh' }

export function RequestTimeline({ request }) {
  return (
    <ol className="request-timeline">
      {stepsFor(request).map((step) => (
        <li
          key={step.label}
          className={clsx('request-timeline__step', `request-timeline__step--${step.state}`)}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <span className="request-timeline__marker" aria-hidden="true">
            {ICONS[step.state] && <Icon name={ICONS[step.state]} size="sm" />}
          </span>
          <span className="request-timeline__label">{step.label}</span>
          {step.detail && <span className="request-timeline__detail">{step.detail}</span>}
        </li>
      ))}
    </ol>
  )
}
