import { useQuery } from '@tanstack/react-query'
import { promotionsApi } from '../api/promotionsApi'

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: promotionsApi.active,
    staleTime: 10 * 60 * 1000,
  })
}
