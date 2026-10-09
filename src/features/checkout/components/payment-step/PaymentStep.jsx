import { useId } from 'react'
import { Button, ChoiceCard, Icon } from '@/components/ui'
import { PAYMENT_METHODS } from '../../constants'
import './payment-step.scss'

export function PaymentStep({ selected, onSelect, onContinue }) {
  const name = useId()

  return (
    <div className="payment-step">
      <fieldset className="payment-step__options">
        <legend className="payment-step__legend">Medio de pago</legend>
        {PAYMENT_METHODS.map((method) => (
          <ChoiceCard
            key={method.value}
            name={name}
            value={method.value}
            checked={selected === method.value}
            onChange={onSelect}
            title={method.label}
            description={method.description}
          />
        ))}
      </fieldset>

      <p className="payment-step__notice">
        <Icon name="info" size="sm" />
        Pagas en el sitio seguro de Mercado Pago: nunca escribes datos bancarios en esta tienda.
        {import.meta.env.VITE_USE_MOCKS === 'true' && ' (Demo: el pago se aprueba al instante.)'}
      </p>

      <Button className="payment-step__continue" disabled={!selected} onClick={onContinue}>
        Revisar pedido
      </Button>
    </div>
  )
}
