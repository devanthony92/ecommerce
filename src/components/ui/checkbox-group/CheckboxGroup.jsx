import { useId } from 'react'
import clsx from 'clsx'
import './checkbox-group.scss'

/**
 * Selección múltiple con checkboxes nativos. Controlado: `value` (array) + `onChange(array)`.
 * options: [{ value, label }]
 */
export function CheckboxGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  required,
  className,
}) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  function toggle(optionValue) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <fieldset className={clsx('checkbox-group', className)} aria-describedby={errorId}>
      <legend className="checkbox-group__legend">
        {legend}
        {required && (
          <span className="checkbox-group__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>
      <div className="checkbox-group__options">
        {options.map((option) => (
          <label key={option.value} className="checkbox-group__option">
            <input
              type="checkbox"
              className="checkbox-group__input"
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              aria-invalid={error ? true : undefined}
              onChange={() => toggle(option.value)}
            />
            <span className="checkbox-group__label">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="checkbox-group__error" id={errorId}>
          {error}
        </p>
      )}
    </fieldset>
  )
}
