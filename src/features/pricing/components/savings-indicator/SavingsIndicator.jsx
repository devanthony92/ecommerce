import clsx from 'clsx'
import { Icon } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './savings-indicator.scss'

// "Ahorras $X (Y%)". Con cantidad > 1 muestra el ahorro total de la línea.
export function SavingsIndicator({ pricing, className }) {
  if (pricing.savings.total <= 0) return null

  return (
    <p className={clsx('savings-indicator', className)}>
      <Icon name="check" size="sm" className="savings-indicator__icon" />
      <span>
        Ahorras{' '}
        <strong className="savings-indicator__amount">{formatMoney(pricing.savings.total)}</strong>
        {pricing.quantity > 1 && ` en ${pricing.quantity} unidades`} ({pricing.savings.percent}%
        frente al precio público)
      </span>
    </p>
  )
}
