import { useId } from 'react'
import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './select-field.scss'

// options: [{ value, label, disabled? }]
export function SelectField({
  ref,
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  hideLabel = false,
  className,
  ...selectProps
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={clsx('select-field', className)}>
      <label
        className={clsx('select-field__label', hideLabel && 'select-field__label--hidden')}
        htmlFor={fieldId}
      >
        {label}
      </label>

      <div className="select-field__wrapper">
        <select
          ref={ref}
          id={fieldId}
          className="select-field__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={clsx(hintId, errorId) || undefined}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size="sm" className="select-field__arrow" />
      </div>

      {hint && (
        <p className="select-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="select-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
