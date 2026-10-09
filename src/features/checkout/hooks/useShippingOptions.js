import { useQuery } from '@tanstack/react-query'
import { checkoutApi } from '../api/checkoutApi'

export function useShippingOptions(addressId) {
  return useQuery({
    queryKey: ['checkout', 'shipping-options', addressId],
    queryFn: () => checkoutApi.getShippingOptions(addressId),
    enabled: Boolean(addressId),
    // El total depende del carrito: siempre se pide fresco al entrar al paso.
    staleTime: 0,
  })
}
