import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { cartKeys } from '@/features/cart'
import { ordersApi } from '../api/ordersApi'
import { ordersKeys } from '../api/ordersKeys'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { refreshSession } = useAuth()
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: async ({ order, levelUp }) => {
      // Subió de nivel: cambian sus precios. Se recarga la sesión antes de cachear el pedido.
      if (levelUp) await refreshSession()
      // La confirmación abre sin volver a pedir el pedido.
      queryClient.setQueryData(ordersKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: ordersKeys.all })
      // El backend vació el carrito al crear el pedido.
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
