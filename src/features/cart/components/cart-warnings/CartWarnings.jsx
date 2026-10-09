import { Icon } from '@/components/ui'
import './cart-warnings.scss'

// Avisos del backend (stock reducido, agotado). role="status": informan sin interrumpir.
export function CartWarnings({ warnings }) {
  if (!warnings?.length) return null

  return (
    <ul className="cart-warnings" role="status">
      {warnings.map((warning) => (
        <li key={`${warning.code}-${warning.cartItemId}`} className="cart-warnings__item">
          <Icon name="alert" size="sm" className="cart-warnings__icon" />
          {warning.message}
        </li>
      ))}
    </ul>
  )
}
