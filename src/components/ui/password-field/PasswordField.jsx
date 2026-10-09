import { useId, useState } from 'react'
import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './password-field.scss'

// Campo de contraseña con botón para mostrarla. Misma API que TextField.
export function PasswordField({ ref, label, hint, error, id, required, className, ...inputProps }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const [visible, setVisible] = useState(false)

  return (
    <div className={clsx('password-field', className)}>
      <label className="password-field__label" htmlFor={fieldId}>
        {label}
        {required && (
          <span className="password-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className="password-field__wrapper">
        <input
          ref={ref}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className="password-field__control"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={clsx(hintId, errorId) || undefined}
          {...inputProps}
        />
        <button
          type="button"
          className="password-field__toggle"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          aria-controls={fieldId}
          onClick={() => setVisible((value) => !value)}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} />
        </button>
      </div>
      {hint && (
        <p className="password-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="password-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
