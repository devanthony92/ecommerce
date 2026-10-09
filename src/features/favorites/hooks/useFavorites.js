import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { favoritesApi } from '../api/favoritesApi'
import { favoritesKeys } from '../api/favoritesKeys'

export function useFavorites() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: favoritesKeys.list(),
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  })
}

// Conjunto de ids para marcar el corazón en tarjetas sin recorrer la lista cada vez.
export function useFavoriteIds() {
  const { data } = useFavorites()
  return useMemo(() => new Set(data?.map((product) => product.id)), [data])
}

/**
 * Agregar o quitar con actualización optimista: el corazón cambia al instante
 * y, si el backend falla, vuelve a su estado anterior.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ product, isFavorite }) =>
      isFavorite ? favoritesApi.remove(product.id) : favoritesApi.add(product.id),
    onMutate: async ({ product, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.list() })
      const previous = queryClient.getQueryData(favoritesKeys.list())
      queryClient.setQueryData(favoritesKeys.list(), (current = []) =>
        isFavorite ? current.filter((item) => item.id !== product.id) : [product, ...current],
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(favoritesKeys.list(), context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoritesKeys.list() }),
  })
}
