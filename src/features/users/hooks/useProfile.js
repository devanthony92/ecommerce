import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth'
import { usersApi } from '../api/usersApi'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.updateMe,
    // El usuario de la sesión se actualiza sin volver a pedir /users/me.
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: usersApi.changePassword })
}
