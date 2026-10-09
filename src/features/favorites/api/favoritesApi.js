import { http } from '@/services/api/apiClient'

export const favoritesApi = {
  list: () => http.get('/favorites'),
  add: (productId) => http.put(`/favorites/${encodeURIComponent(productId)}`),
  remove: (productId) => http.delete(`/favorites/${encodeURIComponent(productId)}`),
}
