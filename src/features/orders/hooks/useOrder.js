import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'
import { ordersKeys } from '../api/ordersKeys'

export function useOrder(id) {
  return useQuery({ queryKey: ordersKeys.detail(id), queryFn: () => ordersApi.get(id) })
}
