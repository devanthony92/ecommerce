import clsx from 'clsx'
import { Badge, Price } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './price-tag.scss'

/**
 * Precio compacto para tarjetas. Representa un PriceView del backend:
 * no calcula nada, solo decide qué mostrar y explica por qué.
 */
// `showVolumeHint=false` cuando la tarjeta ya muestra todas las escalas.
export function PriceTag({ pricing, showVolumeHint = true, className }) {
  const isWholesale = pricing.audience === 'WHOLESALE' && pricing.unitPrice < pricing.listPrice
  const previous = isWholesale ? pricing.listPrice : pricing.compareAtPrice
  const bestTier = showVolumeHint && pricing.tiers.find((tier) => tier.isBest)

  return (
    <div className={clsx('price-tag', isWholesale && 'price-tag--wholesale', className)}>
      {isWholesale && <span className="price-tag__label">Tu precio mayorista</span>}

      <div className="price-tag__row">
        <Price
          amount={pricing.unitPrice}
          tone={isWholesale ? 'wholesale' : 'default'}
          size="lg"
          srLabel={previous ? 'Precio actual' : undefined}
        />
        {previous && (
          <Price
            amount={previous}
            strike
            size="sm"
            srLabel={isWholesale ? 'Precio público' : 'Precio anterior'}
          />
        )}
        {pricing.savings.percent > 0 && (
          <Badge tone={isWholesale ? 'wholesale' : 'success'}>-{pricing.savings.percent}%</Badge>
        )}
      </div>

      {bestTier && (
        <p className="price-tag__volume">
          Desde{' '}
          <strong className="price-tag__volume-price">{formatMoney(bestTier.unitPrice)}</strong> c/u
          llevando {bestTier.minQty}
        </p>
      )}
    </div>
  )
}
