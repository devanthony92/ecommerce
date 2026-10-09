// La URL es la fuente de verdad de los filtros: se pueden compartir, recargar
// y deshacer con el botón Atrás.

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'bestsellers', label: 'Más vendidos' },
  { value: 'newest', label: 'Novedades' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
]

const DEFAULT_SORT = 'relevance'

const toPositiveInt = (value) => {
  const number = Number.parseInt(value, 10)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function parseFilters(searchParams) {
  const sort = searchParams.get('sort')
  return {
    q: searchParams.get('q')?.trim() ?? '',
    sizes: searchParams.getAll('size'),
    colors: searchParams.getAll('color'),
    minPrice: toPositiveInt(searchParams.get('minPrice')),
    maxPrice: toPositiveInt(searchParams.get('maxPrice')),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_SORT,
    page: toPositiveInt(searchParams.get('page')) ?? 1,
  }
}

// Omite valores por defecto para que la URL quede corta y canónica.
export function serializeFilters(filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  filters.sizes?.forEach((size) => params.append('size', size))
  filters.colors?.forEach((color) => params.append('color', color))
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

// Filtros que el usuario puede quitar uno a uno (la búsqueda y el orden no cuentan).
export function countActiveFilters(filters) {
  return (
    filters.sizes.length + filters.colors.length + (filters.minPrice || filters.maxPrice ? 1 : 0)
  )
}

// Parámetros para GET /products.
export function toProductsQuery(filters, categorySlug) {
  return {
    q: filters.q || undefined,
    category: categorySlug || undefined,
    size: filters.sizes.length ? filters.sizes : undefined,
    color: filters.colors.length ? filters.colors : undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    sort: filters.sort,
    page: filters.page,
  }
}
