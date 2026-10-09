import clsx from 'clsx'
import { formatMoney } from '@/utils/formatMoney'
import './tier-strip.scss'

// Escalas compactas para tarjetas de producto (catálogo mayorista).
export function TierStrip({ tiers, className }) {
  if (!tiers?.length) return null

  return (
    <ul className={clsx('tier-strip', className)} aria-label="Precios por cantidad">
      {tiers.map((tier) => (
        <li key={tier.minQty} className="tier-strip__item">
          <span className="tier-strip__quantity">
            {tier.minQty === 1 ? '1 u.' : `${tier.minQty}+`}
          </span>
          <span className="tier-strip__price">{formatMoney(tier.unitPrice)}</span>
        </li>
      ))}
    </ul>
  )
}
