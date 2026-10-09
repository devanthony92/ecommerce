import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import { catalogKeys } from '../api/catalogKeys'

// Las categorías cambian poco: se cachean 10 minutos.
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: catalogApi.getCategories,
    staleTime: 10 * 60 * 1000,
  })
}
