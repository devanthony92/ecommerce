import { useId } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './catalog-filters.scss'

function OptionGroup({ legend, children }) {
  return (
    <fieldset className="catalog-filters__group">
      <legend className="catalog-filters__legend">{legend}</legend>
      <div className="catalog-filters__options">{children}</div>
    </fieldset>
  )
}

/**
 * Filtros del catálogo. Cada cambio se aplica al instante (actualiza la URL).
 * `facets` viene del backend: solo se ofrecen opciones que existen.
 */
export function CatalogFilters({ facets, filters, onToggle, onPriceChange, className }) {
  const id = useId()

  function handlePriceSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const toNumber = (value) => (value ? Number(value) : null)
    onPriceChange({
      minPrice: toNumber(form.get('minPrice')),
      maxPrice: toNumber(form.get('maxPrice')),
    })
  }

  return (
    <div className={clsx('catalog-filters', className)}>
      {facets.sizes.length > 0 && (
        <OptionGroup legend="Talla">
          {facets.sizes.map((size) => (
            <label key={size.value} className="catalog-filters__chip">
              <input
                type="checkbox"
                className="catalog-filters__input"
                checked={filters.sizes.includes(size.value)}
                onChange={() => onToggle('sizes', size.value)}
              />
              <span className="catalog-filters__chip-label">{size.value}</span>
            </label>
          ))}
        </OptionGroup>
      )}

      {facets.colors.length > 0 && (
        <OptionGroup legend="Color">
          {facets.colors.map((color) => (
            <label key={color.value} className="catalog-filters__color">
              <input
                type="checkbox"
                className="catalog-filters__input"
                checked={filters.colors.includes(color.value)}
                onChange={() => onToggle('colors', color.value)}
              />
              <span
                className="catalog-filters__swatch"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <span className="catalog-filters__color-name">{color.value}</span>
              <span className="catalog-filters__count">({color.count})</span>
            </label>
          ))}
        </OptionGroup>
      )}

      <fieldset className="catalog-filters__group">
        <legend className="catalog-filters__legend">Precio</legend>
        <p className="catalog-filters__hint">
          Entre {formatMoney(facets.priceRange.min)} y {formatMoney(facets.priceRange.max)}
        </p>
        {/* key: al limpiar filtros los campos vuelven a quedar vacíos. */}
        <form
          key={`${filters.minPrice}-${filters.maxPrice}`}
          className="catalog-filters__price"
          onSubmit={handlePriceSubmit}
        >
          <label className="catalog-filters__price-field" htmlFor={`${id}-min`}>
            <span className="catalog-filters__price-label">Mínimo</span>
            <input
              id={`${id}-min`}
              className="catalog-filters__price-input"
              name="minPrice"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              placeholder="0"
              defaultValue={filters.minPrice ?? ''}
            />
          </label>
          <label className="catalog-filters__price-field" htmlFor={`${id}-max`}>
            <span className="catalog-filters__price-label">Máximo</span>
            <input
              id={`${id}-max`}
              className="catalog-filters__price-input"
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              placeholder="Sin límite"
              defaultValue={filters.maxPrice ?? ''}
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="catalog-filters__price-submit"
          >
            Aplicar precio
          </Button>
        </form>
      </fieldset>
    </div>
  )
}
