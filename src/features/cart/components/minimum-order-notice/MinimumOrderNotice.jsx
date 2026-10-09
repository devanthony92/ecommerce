import clsx from 'clsx'
import { formatMoney } from '@/utils/formatMoney'
import './minimum-order-notice.scss'

// Pedido mínimo mayorista (lo calcula el backend). No muestra nada si ya se cumple.
export function MinimumOrderNotice({ minimumOrder, className }) {
  if (!minimumOrder || minimumOrder.met) return null

  return (
    <p className={clsx('minimum-order-notice', className)} role="status">
      El pedido mínimo mayorista es de {formatMoney(minimumOrder.amount)} en productos. Te faltan{' '}
      <strong>{formatMoney(minimumOrder.remaining)}</strong>.
    </p>
  )
}
