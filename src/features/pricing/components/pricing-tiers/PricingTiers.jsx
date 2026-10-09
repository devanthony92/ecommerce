import { useId } from 'react'
import clsx from 'clsx'
import { PricingTier } from './PricingTier'
import './pricing-tiers.scss'

/**
 * Tabla de escalas por cantidad ("Compra más, paga menos").
 * Con `onSelect`, cada escala es un botón que fija la cantidad mínima.
 */
export function PricingTiers({ tiers, onSelect, title = 'Compra más, paga menos', className }) {
  const titleId = useId()
  if (!tiers?.length) return null

  return (
    <section className={clsx('pricing-tiers', className)} aria-labelledby={titleId}>
      <h2 className="pricing-tiers__title" id={titleId}>
        {title}
      </h2>
      <ul className="pricing-tiers__list" role="list">
        {tiers.map((tier) => (
          <li key={tier.minQty} className="pricing-tiers__item">
            <PricingTier tier={tier} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  )
}
