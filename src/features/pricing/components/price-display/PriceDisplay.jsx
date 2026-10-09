import clsx from 'clsx'
import { Badge, Price } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import { ruleLabel } from '../../utils/ruleLabel'
import './price-display.scss'

/**
 * Precio completo del detalle de producto. Comunica qué precio ve el usuario
 * y por qué (appliedRules), sin calcular nada: todo viene en el PriceView.
 */
export function PriceDisplay({ pricing, isUpdating = false, className }) {
  const isWholesale = pricing.audience === 'WHOLESALE'
  const hasDiscount = pricing.unitPrice < pricing.listPrice

  return (
    <div
      className={clsx(
        'price-display',
        isWholesale && 'price-display--wholesale',
        isUpdating && 'price-display--updating',
        className,
      )}
      aria-busy={isUpdating || undefined}
    >
      {hasDiscount && (
        <p className="price-display__public">
          Precio público <Price amount={pricing.listPrice} strike size="sm" />
        </p>
      )}

      <div className="price-display__main">
        {isWholesale && hasDiscount && <span className="price-display__label">Tu precio</span>}
        <Price
          amount={pricing.unitPrice}
          size="xl"
          tone={isWholesale ? 'wholesale' : 'default'}
          srLabel={hasDiscount ? 'Precio actual por unidad' : 'Precio por unidad'}
        />
        {pricing.savings.percent > 0 && (
          <Badge tone={isWholesale ? 'wholesale' : 'success'}>-{pricing.savings.percent}%</Badge>
        )}
      </div>

      {pricing.quantity > 1 && (
        <p className="price-display__total">
          Total por {pricing.quantity} unidades:{' '}
          <strong className="price-display__total-amount">{formatMoney(pricing.lineTotal)}</strong>
        </p>
      )}

      {pricing.appliedRules.length > 0 && (
        <ul className="price-display__rules" aria-label="Por qué ves este precio">
          {pricing.appliedRules.map((rule) => (
            <li key={rule.type} className="price-display__rule">
              {ruleLabel(rule)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
