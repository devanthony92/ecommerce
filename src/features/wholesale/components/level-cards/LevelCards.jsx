import clsx from 'clsx'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Badge, Icon } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import { useWholesaleLevels } from '../../hooks/useWholesaleRequest'
import './level-cards.scss'

function rangeLabel(level) {
  if (level.maxPurchase === null) return `Desde ${formatMoney(level.minPurchase)}`
  if (level.minPurchase === 0) return `Hasta ${formatMoney(level.maxPurchase)}`
  return `${formatMoney(level.minPurchase)} – ${formatMoney(level.maxPurchase)}`
}

/**
 * Niveles mayoristas configurados en el backend (nada hardcodeado).
 * `currentCode` resalta el nivel del usuario.
 */
export function LevelCards({ currentCode, className }) {
  const query = useWholesaleLevels()

  return (
    <QueryBoundary query={query} loading={<Skeleton variant="rect" height="10rem" />}>
      {(levels) => (
        <ul className={clsx('level-cards', className)} role="list">
          {levels.map((level) => (
            <li
              key={level.code}
              className={clsx(
                'level-cards__item',
                level.code === currentCode && 'level-cards__item--current',
              )}
              aria-current={level.code === currentCode ? 'true' : undefined}
            >
              <Badge level={level.code.toLowerCase()}>{level.name}</Badge>
              <p className="level-cards__discount">{level.discountPercent}%</p>
              <p className="level-cards__range">Compras al año: {rangeLabel(level)}</p>
              <ul className="level-cards__benefits" role="list">
                {level.benefits.map((benefit) => (
                  <li key={benefit.code} className="level-cards__benefit">
                    <Icon name="check" size="sm" />
                    {benefit.label}
                  </li>
                ))}
              </ul>
              {level.code === currentCode && (
                <span className="level-cards__current-label">Tu nivel</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </QueryBoundary>
  )
}
