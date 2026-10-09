import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'
import { usersKeys } from '../api/usersKeys'

export function useAddresses() {
  return useQuery({ queryKey: usersKeys.addresses(), queryFn: usersApi.getAddresses })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createAddress,
    // Crear una dirección puede cambiar cuál es la predeterminada: se recarga la lista.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.addresses() }),
  })
}
