import clsx from 'clsx'
import { Icon } from '@/components/ui'
import './order-timeline.scss'

const FLOW = [
  { status: 'PAID', label: 'Pedido confirmado' },
  { status: 'PROCESSING', label: 'En preparación' },
  { status: 'SHIPPED', label: 'Enviado' },
  { status: 'DELIVERED', label: 'Entregado' },
]

// Contra entrega no pasa por PAID: arranca en preparación (el primer paso cuenta como hecho).
const POSITION = { PENDING_PAYMENT: -1, PAID: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 }

export function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <p className="order-timeline order-timeline--cancelled">
        <Icon name="alert" size="sm" />
        Este pedido fue cancelado.
      </p>
    )
  }

  const current = POSITION[status]

  return (
    <ol className="order-timeline" aria-label="Seguimiento del pedido">
      {FLOW.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li
            key={step.status}
            className={clsx('order-timeline__step', `order-timeline__step--${state}`)}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="order-timeline__dot" aria-hidden="true">
              {state !== 'upcoming' && <Icon name="check" size="sm" />}
            </span>
            <span className="order-timeline__label">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
