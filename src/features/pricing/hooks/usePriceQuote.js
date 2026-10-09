import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { pricingApi } from '../api/pricingApi'
import { pricingKeys } from '../api/pricingKeys'

/**
 * Precio para una variante y cantidad, calculado por el backend.
 * - Debounce: escribir "24" no dispara cotizaciones para 2 y 24.
 * - Con cantidad 1 usa `initialPricing` (ya viene con el producto) sin pedir nada.
 * - Mientras cotiza mantiene el precio anterior (sin parpadeo).
 */
export function usePriceQuote({ variantId, quantity, initialPricing }) {
  const debouncedQuantity = useDebouncedValue(quantity, 300)
  const needsQuote = debouncedQuantity !== 1

  const query = useQuery({
    queryKey: pricingKeys.quote(variantId, debouncedQuantity),
    queryFn: async () => {
      const { items } = await pricingApi.quote([{ variantId, quantity: debouncedQuantity }])
      return items[0].pricing
    },
    enabled: Boolean(variantId) && needsQuote,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })

  const pricing = needsQuote ? (query.data ?? initialPricing) : initialPricing

  return {
    pricing,
    // Cantidad escrita que aún no se refleja en el precio mostrado.
    isUpdating: quantity !== debouncedQuantity || (needsQuote && query.isFetching),
    isError: query.isError,
  }
}
