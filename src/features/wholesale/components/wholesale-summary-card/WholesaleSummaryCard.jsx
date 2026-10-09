import { useId } from 'react'
import clsx from 'clsx'
import { Badge, Price } from '@/components/ui'
import './wholesale-summary-card.scss'

const year = (period) => period.from.slice(0, 4)

// Resumen de la cuenta mayorista: compra acumulada del año y pedido mínimo.
export function WholesaleSummaryCard({ name, profile, className }) {
  const titleId = useId()
  const { accumulatedPurchase, minimumOrder, period } = profile

  return (
    <section className={clsx('wholesale-summary-card', className)} aria-labelledby={titleId}>
      <header className="wholesale-summary-card__header">
        <h2 className="wholesale-summary-card__greeting" id={titleId}>
          Hola, {name.split(' ')[0]}
        </h2>
        <Badge tone="wholesale">Cuenta mayorista</Badge>
      </header>

      <dl className="wholesale-summary-card__stats">
        <div className="wholesale-summary-card__stat">
          <dt className="wholesale-summary-card__label">Compra acumulada {year(period)}</dt>
          <dd className="wholesale-summary-card__value">
            <Price amount={accumulatedPurchase} size="xl" />
          </dd>
        </div>
        <div className="wholesale-summary-card__stat">
          <dt className="wholesale-summary-card__label">Pedido mínimo</dt>
          <dd className="wholesale-summary-card__value">
            <Price amount={minimumOrder} size="xl" />
          </dd>
        </div>
      </dl>
    </section>
  )
}
