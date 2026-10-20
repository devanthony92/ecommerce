import { useId } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import { Button, Price } from '@/components/ui'
import { unitsLabel } from '@/features/pricing'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { MinimumOrderNotice } from '../minimum-order-notice/MinimumOrderNotice'
import './cart-summary.scss'

// Totales tal como los devuelve el backend. No se suma nada aquí.
export function CartSummary({ summary, minimumOrder, className }) {
  const isBelowMinimum = Boolean(minimumOrder && !minimumOrder.met)

  const titleId = useId()
  return (
    <section className={clsx('cart-summary', className)} aria-labelledby={titleId}>
      <h2 className="cart-summary__title" id={titleId}>
        Resumen del pedido
      </h2>

      <dl className="cart-summary__rows">
        <div className="cart-summary__row">
          <dt>Subtotal ({unitsLabel(summary.itemsCount)})</dt>
          <dd>
            <Price amount={summary.subtotal} size="sm" />
          </dd>
        </div>
        {summary.discountTotal > 0 && (
          <div className="cart-summary__row cart-summary__row--discount">
            <dt>Descuentos</dt>
            <dd>−{formatMoney(summary.discountTotal)}</dd>
          </div>
        )}
        <div className="cart-summary__row">
          <dt>Envío</dt>
          <dd>{summary.shipping === 0 ? 'Gratis' : formatMoney(summary.shipping)}</dd>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <dt>Total</dt>
          <dd>
            <Price amount={summary.total} size="lg" />
          </dd>
        </div>
      </dl>

      {summary.savingsTotal > 0 && (
        <p className="cart-summary__savings">
          Estás ahorrando {formatMoney(summary.savingsTotal)} frente al precio público.
        </p>
      )}

      <MinimumOrderNotice minimumOrder={minimumOrder} />

      {/* Sin sesión, RequireAuth lleva al login y vuelve al checkout. */}
      {isBelowMinimum ? (
        <Button size="lg" block disabled>
          Finalizar compra
        </Button>
      ) : (
        <Button as={Link} to={paths.checkout} size="lg" block>
          Finalizar compra
        </Button>
      )}
    </section>
  )
}
