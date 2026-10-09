import { http } from '@/services/api/apiClient'

export const ordersApi = {
  create: (data) => http.post('/orders', data),
  list: (params) => http.get('/orders', { params }),
  get: (id) => http.get(`/orders/${encodeURIComponent(id)}`),
  cancel: ({ id, reason }) => http.post(`/orders/${encodeURIComponent(id)}/cancel`, { reason }),
  // Agrega al carrito lo que siga disponible y devuelve el Cart (con warnings).
  reorder: (id) => http.post(`/orders/${encodeURIComponent(id)}/reorder`),
}
