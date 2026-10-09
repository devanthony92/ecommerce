import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { catalogApi } from '../api/catalogApi'
import { catalogKeys } from '../api/catalogKeys'

// Búsqueda de variantes por SKU o nombre (pedido rápido). Desde 2 caracteres.
export function useVariantLookup(text) {
  const q = useDebouncedValue(text.trim(), 300)
  const query = useQuery({
    queryKey: catalogKeys.lookup(q),
    queryFn: () => catalogApi.lookupVariants(q),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
  })
  return { ...query, q, isTyping: text.trim() !== q }
}
