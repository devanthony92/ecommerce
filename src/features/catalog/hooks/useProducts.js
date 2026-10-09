import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import { catalogKeys } from '../api/catalogKeys'

// keepPreviousData: al cambiar filtro o página se mantiene la grilla anterior
// (atenuada) en vez de volver al skeleton.
export function useProducts(params) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: keepPreviousData,
  })
}
