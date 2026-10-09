import { useId } from 'react'
import clsx from 'clsx'
import { Price, ResponsiveImage } from '@/components/ui'
import { variantLabel } from '@/features/cart'
import { formatMoney } from '@/utils/formatMoney'
import './checkout-summary.scss'

/**
 * Resumen lateral del pedido. Con opción de envío elegida, el total es el que
 * calculó el backend para esa opción; antes, el del carrito (envío estándar).
 */
export function CheckoutSummary({ cart, shippingOption, className }) {
  const titleId = useId()
  const items = cart.items.filter((item) => item.available)
  const shipping = shippingOption ? shippingOption.price : cart.summary.shipping
  const total = shippingOption ? shippingOption.total : cart.summary.total

  return (
    <aside className={clsx('checkout-summary', className)} aria-labelledby={titleId}>
      <h2 className="checkout-summary__title" id={titleId}>
        Tu pedido
      </h2>

      <ul className="checkout-summary__items" role="list">
        {items.map((item) => (
          <li key={item.id} className="checkout-summary__item">
            <ResponsiveImage src={item.image.url} alt="" className="checkout-summary__image" />
            <span className="checkout-summary__name">
              {item.name}
              <span className="checkout-summary__meta">
                {variantLabel(item.variant.attributes)} × {item.quantity}
              </span>
            </span>
            <Price amount={item.pricing.lineTotal} size="sm" />
          </li>
        ))}
      </ul>

      <dl className="checkout-summary__rows">
        <div className="checkout-summary__row">
          <dt>Subtotal</dt>
          <dd>{formatMoney(cart.summary.subtotal)}</dd>
        </div>
        {cart.summary.discountTotal > 0 && (
          <div className="checkout-summary__row checkout-summary__row--discount">
            <dt>Descuentos</dt>
            <dd>−{formatMoney(cart.summary.discountTotal)}</dd>
          </div>
        )}
        <div className="checkout-summary__row">
          <dt>Envío{shippingOption ? '' : ' (estándar)'}</dt>
          <dd>{shipping === 0 ? 'Gratis' : formatMoney(shipping)}</dd>
        </div>
        <div className="checkout-summary__row checkout-summary__row--total">
          <dt>Total</dt>
          <dd>
            <Price amount={total} size="lg" />
          </dd>
        </div>
      </dl>
    </aside>
  )
}
