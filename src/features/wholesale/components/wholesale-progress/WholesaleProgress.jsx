import clsx from 'clsx'
import { ProgressBar } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './wholesale-progress.scss'

// Progreso hacia el siguiente nivel con los números que calcula el backend.
export function WholesaleProgress({ profile, className }) {
  const { nextLevel, amountToNextLevel, progressPercent } = profile

  if (!nextLevel) {
    return (
      <p className={clsx('wholesale-progress', 'wholesale-progress--max', className)}>
        Estás en el nivel más alto del programa.
      </p>
    )
  }

  return (
    <div className={clsx('wholesale-progress', className)}>
      <ProgressBar
        value={progressPercent}
        tone="wholesale"
        label={`Progreso hacia nivel ${nextLevel.name}`}
        valueText={`${progressPercent}%`}
      />
      <p className="wholesale-progress__message">
        Faltan{' '}
        <strong className="wholesale-progress__amount">{formatMoney(amountToNextLevel)}</strong>{' '}
        para {nextLevel.name} ({nextLevel.discountPercent}% de descuento).
      </p>
    </div>
  )
}
