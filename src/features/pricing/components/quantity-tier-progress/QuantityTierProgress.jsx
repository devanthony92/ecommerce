import clsx from 'clsx'
import { ProgressBar } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import { unitsLabel } from '../../utils/ruleLabel'
import './quantity-tier-progress.scss'

/**
 * Incentivo hacia la siguiente escala ("Agrega 1 unidad y desbloquea…").
 * Usa nextTier y tiers del PriceView; no inventa reglas.
 */
export function QuantityTierProgress({ pricing, className }) {
  const { tiers, nextTier, quantity } = pricing
  if (!tiers.length) return null

  if (!nextTier) {
    return (
      <p className={clsx('quantity-tier-progress', 'quantity-tier-progress--done', className)}>
        Tienes el mejor precio por volumen.
      </p>
    )
  }

  const currentMin = tiers.find((tier) => tier.isCurrent)?.minQty ?? 1
  const span = nextTier.minQty - currentMin
  const done = quantity - currentMin

  return (
    <div className={clsx('quantity-tier-progress', className)}>
      <p className="quantity-tier-progress__message">
        Agrega{' '}
        <strong className="quantity-tier-progress__units">
          {unitsLabel(nextTier.unitsToReach)}
        </strong>{' '}
        más y obtén precio de {nextTier.label.toLowerCase()}:{' '}
        <strong className="quantity-tier-progress__price">{formatMoney(nextTier.unitPrice)}</strong>{' '}
        c/u.
      </p>
      <ProgressBar
        value={done}
        max={span}
        size="sm"
        tone="success"
        label={`Progreso hacia ${nextTier.label.toLowerCase()}`}
        valueText={`${quantity} de ${nextTier.minQty} unidades`}
      />
    </div>
  )
}
