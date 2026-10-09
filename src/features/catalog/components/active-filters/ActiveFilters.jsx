import { Icon } from '@/components/ui'
import { formatMoney } from '@/utils/formatMoney'
import './active-filters.scss'

function priceLabel(min, max) {
  if (min && max) return `${formatMoney(min)} – ${formatMoney(max)}`
  if (min) return `Desde ${formatMoney(min)}`
  return `Hasta ${formatMoney(max)}`
}

// Chips de filtros aplicados: cada uno se quita con un click.
export function ActiveFilters({ filters, onToggle, onPriceClear, onReset }) {
  const chips = [
    ...filters.sizes.map((size) => ({
      key: `size-${size}`,
      label: `Talla ${size}`,
      onRemove: () => onToggle('sizes', size),
    })),
    ...filters.colors.map((color) => ({
      key: `color-${color}`,
      label: color,
      onRemove: () => onToggle('colors', color),
    })),
  ]
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      onRemove: onPriceClear,
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="active-filters">
      <ul className="active-filters__list" role="list" aria-label="Filtros aplicados">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              className="active-filters__chip"
              onClick={chip.onRemove}
              aria-label={`Quitar filtro ${chip.label}`}
            >
              {chip.label}
              <Icon name="close" size="sm" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="active-filters__reset" onClick={onReset}>
        Limpiar filtros
      </button>
    </div>
  )
}
