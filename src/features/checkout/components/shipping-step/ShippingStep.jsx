import { useId } from 'react'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Button, ChoiceCard } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './shipping-step.scss'

// Opciones de envío para la dirección elegida (precio y total vienen del backend).
export function ShippingStep({ query, selectedId, onSelect, onContinue }) {
  const name = useId()

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="8rem" />}
      errorTitle="No pudimos calcular el envío"
    >
      {(options) => (
        <div className="shipping-step">
          <fieldset className="shipping-step__options">
            <legend className="shipping-step__legend">Opciones de envío</legend>
            {options.map((option) => (
              <ChoiceCard
                key={option.id}
                name={name}
                value={option.id}
                checked={selectedId === option.id}
                onChange={onSelect}
                title={option.label}
                description={`${option.estimatedDays} · ${option.description}`}
                aside={option.price === 0 ? 'Gratis' : formatMoney(option.price)}
              />
            ))}
          </fieldset>
          <Button className="shipping-step__continue" disabled={!selectedId} onClick={onContinue}>
            Continuar
          </Button>
        </div>
      )}
    </QueryBoundary>
  )
}
