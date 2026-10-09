import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from '@/features/cart'
import { ordersApi } from '../api/ordersApi'
import { ordersKeys } from '../api/ordersKeys'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: ({ order }) => {
      // La confirmación abre sin volver a pedir el pedido.
      queryClient.setQueryData(ordersKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: ordersKeys.all })
      // El backend vació el carrito al crear el pedido.
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
