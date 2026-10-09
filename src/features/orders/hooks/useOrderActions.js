import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from '@/features/cart'
import { ordersApi } from '../api/ordersApi'
import { ordersKeys } from '../api/ordersKeys'

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

// Solo pide la URL de pago: quien la usa decide cuándo redirigir.
export function usePayOrder() {
  return useMutation({ mutationFn: ordersApi.pay })
}

export function useReorder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.reorder,
    // El backend devuelve el carrito actualizado: se usa sin volver a pedirlo.
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.server(), cart),
  })
}
