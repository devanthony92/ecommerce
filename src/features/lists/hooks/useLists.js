import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from '@/features/cart'
import { listsApi } from '../api/listsApi'
import { listsKeys } from '../api/listsKeys'

// `enabled`: el modal "Guardar en lista" solo las pide al abrirse.
export function useLists({ enabled = true } = {}) {
  return useQuery({ queryKey: listsKeys.list(), queryFn: listsApi.list, enabled })
}

export function useList(id) {
  return useQuery({ queryKey: listsKeys.detail(id), queryFn: () => listsApi.get(id) })
}

// Cualquier cambio en una lista refresca el índice y su detalle.
function useListMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listsKeys.all }),
  })
}

export const useCreateList = () => useListMutation(listsApi.create)
export const useRenameList = () => useListMutation(listsApi.rename)
export const useDeleteList = () => useListMutation(listsApi.remove)
export const useAddToList = () => useListMutation(listsApi.addItem)
export const useUpdateListItem = () => useListMutation(listsApi.updateItem)
export const useRemoveListItem = () => useListMutation(listsApi.removeItem)

export function useAddListToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: listsApi.addToCart,
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.server(), cart),
  })
}
