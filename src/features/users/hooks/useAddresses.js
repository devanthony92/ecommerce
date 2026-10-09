import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'
import { usersKeys } from '../api/usersKeys'

export function useAddresses() {
  return useQuery({ queryKey: usersKeys.addresses(), queryFn: usersApi.getAddresses })
}

// Cambiar una dirección puede cambiar cuál es la predeterminada: se recarga la lista.
function useAddressMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.addresses() }),
  })
}

export const useCreateAddress = () => useAddressMutation(usersApi.createAddress)

export const useUpdateAddress = () =>
  useAddressMutation(({ id, ...data }) => usersApi.updateAddress(id, data))

export const useDeleteAddress = () => useAddressMutation(usersApi.deleteAddress)
