import { http } from '@/services/api/apiClient'

export const ordersApi = {
  create: (data) => http.post('/orders', data),
  list: (params) => http.get('/orders', { params }),
  get: (id) => http.get(`/orders/${encodeURIComponent(id)}`),
}
