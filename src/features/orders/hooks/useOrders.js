import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'
import { ordersKeys } from '../api/ordersKeys'

export function useOrders(params = {}) {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData,
  })
}
