import { useId } from 'react'
import clsx from 'clsx'
import './checkbox.scss'

export function Checkbox({ ref, label, description, error, id, className, ...inputProps }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={clsx('checkbox', className)}>
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="checkbox__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={clsx(descriptionId, errorId) || undefined}
        {...inputProps}
      />
      <label className="checkbox__label" htmlFor={fieldId}>
        {label}
      </label>
      {description && (
        <p className="checkbox__description" id={descriptionId}>
          {description}
        </p>
      )}
      {error && (
        <p className="checkbox__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
