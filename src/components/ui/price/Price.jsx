import clsx from 'clsx'
import { formatMoney } from '@/utils/formatMoney'
import './price.scss'

/**
 * Muestra un monto ya calculado por el backend. No hace cálculos.
 * tone: default | muted | highlight | wholesale | success
 * strike: precio anterior tachado. `srLabel` da contexto a lectores de pantalla.
 */
export function Price({
  amount,
  tone = 'default',
  size = 'md',
  strike = false,
  srLabel,
  className,
}) {
  const Tag = strike ? 's' : 'span'
  return (
    <Tag
      className={clsx(
        'price',
        `price--${tone}`,
        `price--${size}`,
        strike && 'price--strike',
        className,
      )}
    >
      {srLabel && <span className="price__sr-label">{srLabel} </span>}
      {formatMoney(amount)}
    </Tag>
  )
}
