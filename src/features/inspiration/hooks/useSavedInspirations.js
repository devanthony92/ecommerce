import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { deleteInspiration, getInspirations, saveInspiration } from '@/utils/MainApi'

export const inspirationKeys = {
  saved: () => ['inspirations', 'saved'],
}

// Inspiraciones guardadas en nuestro back-end. Sin sesión no se piden.
export function useSavedInspirations() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: inspirationKeys.saved(),
    queryFn: getInspirations,
    enabled: isAuthenticated,
  })
}

/**
 * Guarda una foto de Pexels o, si ya estaba guardada, la quita.
 * `saved`: la inspiración guardada correspondiente (o null).
 */
export function useToggleInspiration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photo, keyword, saved }) =>
      saved ? deleteInspiration(saved.id) : saveInspiration({ ...photo, keyword }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inspirationKeys.saved() }),
  })
}

export function useDeleteInspiration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInspiration,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inspirationKeys.saved() }),
  })
}
