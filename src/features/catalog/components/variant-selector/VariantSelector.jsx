import { useId } from 'react'
import clsx from 'clsx'
import './variant-selector.scss'

/**
 * Selector de color y talla con radios nativos (teclado con flechas, lectores de pantalla).
 * Las combinaciones sin stock se muestran tachadas y deshabilitadas.
 */
export function VariantSelector({ selection, colorHexes, className }) {
  const name = useId()
  const { colors, sizeStates, color, size, setColor, setSize } = selection
  const isSingleSize = sizeStates.length === 1

  return (
    <div className={clsx('variant-selector', className)}>
      <fieldset className="variant-selector__group">
        <legend className="variant-selector__legend">
          Color: <span className="variant-selector__value">{color}</span>
        </legend>
        <div className="variant-selector__options">
          {colors.map((option) => (
            <label
              key={option.value}
              className={clsx(
                'variant-selector__color',
                !option.available && 'variant-selector__color--unavailable',
              )}
            >
              <input
                type="radio"
                className="variant-selector__input"
                name={`${name}-color`}
                value={option.value}
                checked={color === option.value}
                onChange={() => setColor(option.value)}
              />
              <span
                className="variant-selector__swatch"
                style={{ backgroundColor: colorHexes[option.value] }}
                aria-hidden="true"
              />
              <span className="variant-selector__sr-label">
                {option.value}
                {!option.available && ' (agotado)'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {isSingleSize ? (
        <p className="variant-selector__single">Talla: {sizeStates[0].size}</p>
      ) : (
        <fieldset className="variant-selector__group">
          <legend className="variant-selector__legend">
            Talla
            {size && (
              <>
                : <span className="variant-selector__value">{size}</span>
              </>
            )}
          </legend>
          <div className="variant-selector__options">
            {sizeStates.map((state) => (
              <label key={state.size} className="variant-selector__size">
                <input
                  type="radio"
                  className="variant-selector__input"
                  name={`${name}-size`}
                  value={state.size}
                  checked={size === state.size}
                  disabled={!state.available}
                  onChange={() => setSize(state.size)}
                />
                <span className="variant-selector__size-label">
                  {state.size}
                  {!state.available && (
                    <span className="variant-selector__sr-label"> (agotada)</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
