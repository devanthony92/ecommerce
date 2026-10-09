import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { countActiveFilters, parseFilters, serializeFilters } from '../utils/catalogFilters'

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  // Cualquier cambio de filtro vuelve a la página 1, salvo que se pida otra.
  const update = useCallback(
    (changes) => setSearchParams(serializeFilters({ ...filters, page: 1, ...changes })),
    [filters, setSearchParams],
  )

  const toggleValue = useCallback(
    (key, value) => {
      const current = filters[key]
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      update({ [key]: next })
    },
    [filters, update],
  )

  // Limpia filtros pero conserva la búsqueda y el orden.
  const reset = useCallback(
    () => update({ sizes: [], colors: [], minPrice: null, maxPrice: null }),
    [update],
  )

  const pageHref = useCallback(
    (page) => {
      const query = serializeFilters({ ...filters, page }).toString()
      return query ? `?${query}` : '?'
    },
    [filters],
  )

  return {
    filters,
    activeCount: countActiveFilters(filters),
    update,
    toggleValue,
    reset,
    pageHref,
  }
}
