import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Button, Icon } from '@/components/ui'
import './checkout-step.scss'

/**
 * Un paso del checkout. status: upcoming | current | complete.
 * Completo: muestra el resumen de lo elegido y "Cambiar".
 * Al volverse actual, el foco pasa a su título (teclado y lectores de pantalla).
 */
export function CheckoutStep({ number, title, status, summary, onEdit, children }) {
  const headingRef = useRef(null)
  const wasCurrent = useRef(status === 'current')

  useEffect(() => {
    if (status === 'current' && !wasCurrent.current) headingRef.current?.focus()
    wasCurrent.current = status === 'current'
  }, [status])

  return (
    <section
      className={clsx('checkout-step', `checkout-step--${status}`)}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      <header className="checkout-step__header">
        <span className="checkout-step__number" aria-hidden="true">
          {status === 'complete' ? <Icon name="check" size="sm" /> : number}
        </span>
        <h2 className="checkout-step__title" ref={headingRef} tabIndex={-1}>
          <span className="checkout-step__sr-label">Paso {number}: </span>
          {title}
        </h2>
        {status === 'complete' && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="checkout-step__edit">
            Cambiar
          </Button>
        )}
      </header>

      {status === 'complete' && summary && <div className="checkout-step__summary">{summary}</div>}
      {status === 'current' && <div className="checkout-step__body">{children}</div>}
    </section>
  )
}
