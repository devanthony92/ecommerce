import { useId } from 'react'
import clsx from 'clsx'
import { Badge, Price } from '@/components/ui'
import { WholesaleProgress } from '../wholesale-progress/WholesaleProgress'
import './wholesale-level-card.scss'

const year = (period) => period.from.slice(0, 4)

// Resumen del nivel comercial: nivel, descuento, compra acumulada y progreso.
export function WholesaleLevelCard({ name, profile, className }) {
  const titleId = useId()
  const { currentLevel, accumulatedPurchase, period } = profile

  return (
    <section className={clsx('wholesale-level-card', className)} aria-labelledby={titleId}>
      <header className="wholesale-level-card__header">
        <h2 className="wholesale-level-card__greeting" id={titleId}>
          Hola, {name.split(' ')[0]}
        </h2>
        <Badge level={currentLevel.code.toLowerCase()}>Nivel {currentLevel.name}</Badge>
      </header>

      <dl className="wholesale-level-card__stats">
        <div className="wholesale-level-card__stat">
          <dt className="wholesale-level-card__label">Descuento actual</dt>
          <dd className="wholesale-level-card__value">{currentLevel.discountPercent}%</dd>
        </div>
        <div className="wholesale-level-card__stat">
          <dt className="wholesale-level-card__label">Compra acumulada {year(period)}</dt>
          <dd className="wholesale-level-card__value">
            <Price amount={accumulatedPurchase} size="xl" />
          </dd>
        </div>
      </dl>

      <WholesaleProgress profile={profile} />
    </section>
  )
}
