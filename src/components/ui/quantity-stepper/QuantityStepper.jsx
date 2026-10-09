import { useId, useState } from 'react'
import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './quantity-stepper.scss'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max ?? Infinity)
}

/**
 * Control de cantidad [-] n [+]. Controlado: `value` + `onChange(nuevoValor)`.
 * El texto escrito se valida al salir del campo o al presionar Enter.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  label = 'Cantidad',
  size = 'md',
  disabled = false,
  className,
}) {
  const inputId = useId()
  const [draft, setDraft] = useState(null)

  function commit(next) {
    const parsed = Number.parseInt(next, 10)
    const safe = Number.isNaN(parsed) ? value : clamp(parsed, min, max)
    setDraft(null)
    if (safe !== value) onChange(safe)
  }

  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && (max === undefined || value < max)

  return (
    <div className={clsx('quantity-stepper', `quantity-stepper--${size}`, className)}>
      <label className="quantity-stepper__label" htmlFor={inputId}>
        {label}
      </label>
      <button
        type="button"
        className="quantity-stepper__button"
        aria-label={`Disminuir ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={!canDecrease}
        onClick={() => commit(value - step)}
      >
        <Icon name="minus" size="sm" />
      </button>
      <input
        id={inputId}
        className="quantity-stepper__input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        value={draft ?? value}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(event.currentTarget.value)
          if (event.key === 'ArrowUp' && canIncrease) {
            event.preventDefault()
            commit(value + step)
          }
          if (event.key === 'ArrowDown' && canDecrease) {
            event.preventDefault()
            commit(value - step)
          }
        }}
      />
      <button
        type="button"
        className="quantity-stepper__button"
        aria-label={`Aumentar ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={!canIncrease}
        onClick={() => commit(value + step)}
      >
        <Icon name="plus" size="sm" />
      </button>
    </div>
  )
}
