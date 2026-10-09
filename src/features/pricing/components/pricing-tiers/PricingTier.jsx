import clsx from 'clsx'
import { formatMoney } from '@/utils/formatMoney'
import { unitsLabel } from '../../utils/ruleLabel'

// Una escala. Es elemento del bloque pricing-tiers (no tiene estilos propios).
export function PricingTier({ tier, onSelect }) {
  const Tag = onSelect ? 'button' : 'div'

  return (
    <Tag
      className={clsx(
        'pricing-tiers__tier',
        tier.isCurrent && 'pricing-tiers__tier--current',
        tier.isBest && 'pricing-tiers__tier--best',
      )}
      {...(onSelect && {
        type: 'button',
        onClick: () => onSelect(tier.minQty),
        'aria-pressed': tier.isCurrent,
        'aria-label': `${tier.label}: desde ${unitsLabel(tier.minQty)}, ${formatMoney(tier.unitPrice)} por unidad${tier.isBest ? ', mejor precio' : ''}`,
      })}
    >
      {tier.isBest && <span className="pricing-tiers__best">Mejor precio</span>}
      <span className="pricing-tiers__quantity">
        {tier.minQty === 1 ? '1 unidad' : `${tier.minQty}+ unidades`}
      </span>
      <span className="pricing-tiers__price">{formatMoney(tier.unitPrice)}</span>
      <span className="pricing-tiers__unit">c/u</span>
      {tier.savingsPercent > 0 && (
        <span className="pricing-tiers__savings">Ahorra {tier.savingsPercent}%</span>
      )}
    </Tag>
  )
}
