import clsx from 'clsx'
import { ProgressBar } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './cart-incentives.scss'

const units = (count) => `${count} ${count === 1 ? 'unidad' : 'unidades'}`

export function FreeShippingProgress({ incentive }) {
  if (incentive.achieved) {
    return (
      <p className="cart-incentives__item cart-incentives__item--done">
        Tu pedido tiene envío gratis.
      </p>
    )
  }

  return (
    <div className="cart-incentives__item">
      <p className="cart-incentives__message">
        Agrega{' '}
        <strong className="cart-incentives__strong">{formatMoney(incentive.remaining)}</strong> más
        y obtén envío gratis.
      </p>
      <ProgressBar
        value={incentive.current}
        max={incentive.target}
        size="sm"
        tone="success"
        label="Progreso hacia envío gratis"
        valueText={`${formatMoney(incentive.current)} de ${formatMoney(incentive.target)}`}
      />
    </div>
  )
}

function QuantityTierIncentive({ incentive }) {
  return (
    <div className="cart-incentives__item">
      <p className="cart-incentives__message">
        <strong className="cart-incentives__strong">{incentive.productName}:</strong> agrega{' '}
        {units(incentive.remaining)} más (cualquier talla o color) y paga{' '}
        <strong className="cart-incentives__strong">
          {formatMoney(incentive.targetUnitPrice)}
        </strong>{' '}
        c/u por {incentive.targetLabel.toLowerCase()}.
      </p>
      <ProgressBar
        value={incentive.current}
        max={incentive.target}
        size="sm"
        label={`Progreso de ${incentive.productName} hacia ${incentive.targetLabel.toLowerCase()}`}
        valueText={`${incentive.current} de ${incentive.target} unidades`}
      />
    </div>
  )
}

/**
 * Incentivos de compra que calcula el backend (escalas y envío gratis).
 * `limit` para mostrar solo los más cercanos (p. ej. en el drawer).
 */
export function CartIncentives({ incentives, limit, className }) {
  const tiers = incentives
    .filter((incentive) => incentive.type === 'QUANTITY_TIER')
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, limit)
  const shipping = incentives.find((incentive) => incentive.type === 'FREE_SHIPPING')

  if (!tiers.length && !shipping) return null

  return (
    <section className={clsx('cart-incentives', className)} aria-label="Beneficios por comprar más">
      {shipping && <FreeShippingProgress incentive={shipping} />}
      {tiers.map((incentive) => (
        <QuantityTierIncentive key={incentive.productId} incentive={incentive} />
      ))}
    </section>
  )
}
