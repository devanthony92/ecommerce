import clsx from 'clsx'
import './choice-card.scss'

/**
 * Opción tipo tarjeta sobre un radio nativo (flechas del teclado, lectores de pantalla).
 * Agrupar varias dentro de un <fieldset> con <legend>.
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
  disabled = false,
  className,
}) {
  return (
    <label
      className={clsx(
        'choice-card',
        checked && 'choice-card--checked',
        disabled && 'choice-card--disabled',
        className,
      )}
    >
      <input
        type="radio"
        className="choice-card__input"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="choice-card__content">
        <span className="choice-card__title">{title}</span>
        {description && <span className="choice-card__description">{description}</span>}
      </span>
      {aside && <span className="choice-card__aside">{aside}</span>}
    </label>
  )
}
