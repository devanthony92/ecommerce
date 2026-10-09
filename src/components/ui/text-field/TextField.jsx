import { useId } from 'react'
import clsx from 'clsx'
import './text-field.scss'

export function TextField({
  ref,
  label,
  hint,
  error,
  id,
  multiline = false,
  required,
  className,
  ...inputProps
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const Control = multiline ? 'textarea' : 'input'

  return (
    <div className={clsx('text-field', error && 'text-field--invalid', className)}>
      <label className="text-field__label" htmlFor={fieldId}>
        {label}
        {required && (
          <span className="text-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      <Control
        ref={ref}
        id={fieldId}
        className={clsx('text-field__control', multiline && 'text-field__control--multiline')}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={clsx(hintId, errorId) || undefined}
        {...inputProps}
      />

      {hint && (
        <p className="text-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
