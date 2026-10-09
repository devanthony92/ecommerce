import { useId } from 'react'
import clsx from 'clsx'
import './checkbox.scss'

export function Checkbox({ ref, label, description, id, className, ...inputProps }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const descriptionId = description ? `${fieldId}-description` : undefined

  return (
    <div className={clsx('checkbox', className)}>
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="checkbox__input"
        aria-describedby={descriptionId}
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
    </div>
  )
}
