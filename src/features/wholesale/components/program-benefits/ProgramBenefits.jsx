import clsx from 'clsx'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Icon } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import { useWholesaleProgram } from '../../hooks/useWholesaleRequest'
import './program-benefits.scss'

/**
 * Beneficios y condiciones del programa mayorista, configurados en el backend
 * (nada hardcodeado).
 */
export function ProgramBenefits({ className }) {
  const query = useWholesaleProgram()

  return (
    <QueryBoundary query={query} loading={<Skeleton variant="rect" height="8rem" />}>
      {(program) => (
        <div className={clsx('program-benefits', className)}>
          <ul className="program-benefits__list" role="list">
            {program.benefits.map((benefit) => (
              <li key={benefit.code} className="program-benefits__item">
                <Icon name="check" size="sm" />
                {benefit.label}
              </li>
            ))}
          </ul>
          <p className="program-benefits__minimum">
            Pedido mínimo: <strong>{formatMoney(program.minimumOrder)}</strong> en productos.
          </p>
        </div>
      )}
    </QueryBoundary>
  )
}
