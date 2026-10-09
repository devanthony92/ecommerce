import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import { catalogKeys } from '../api/catalogKeys'

export function useProduct(slug) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogApi.getProduct(slug),
  })
}
