import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { wholesaleApi } from '../api/wholesaleApi'
import { wholesaleKeys } from '../api/wholesaleKeys'

export function useWholesaleProgram() {
  return useQuery({
    queryKey: wholesaleKeys.program(),
    queryFn: wholesaleApi.getProgram,
    staleTime: 30 * 60 * 1000,
  })
}

export function useWholesaleProfile() {
  return useQuery({ queryKey: wholesaleKeys.profile(), queryFn: wholesaleApi.getProfile })
}

export function useFrequentProducts() {
  return useQuery({
    queryKey: wholesaleKeys.frequent(),
    queryFn: wholesaleApi.getFrequentProducts,
  })
}

export function useWholesaleRequest() {
  return useQuery({ queryKey: wholesaleKeys.request(), queryFn: wholesaleApi.getMyRequest })
}

// Enviar la solicitud cambia los permisos del usuario (ya no puede volver a solicitar).
export function useSubmitWholesaleRequest() {
  const queryClient = useQueryClient()
  const { refreshSession } = useAuth()
  return useMutation({
    mutationFn: wholesaleApi.submitRequest,
    onSuccess: async (request) => {
      await refreshSession()
      queryClient.setQueryData(wholesaleKeys.request(), request)
    },
  })
}

export function useSimulateReview() {
  const queryClient = useQueryClient()
  const { refreshSession } = useAuth()
  return useMutation({
    mutationFn: wholesaleApi.simulateReview,
    onSuccess: async ({ request }) => {
      await refreshSession()
      queryClient.setQueryData(wholesaleKeys.request(), request)
    },
  })
}
