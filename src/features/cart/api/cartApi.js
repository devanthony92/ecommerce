import { http } from '@/services/api/apiClient'

export const cartApi = {
  get: () => http.get('/cart'),
  addItem: ({ variantId, quantity }) => http.post('/cart/items', { variantId, quantity }),
  addItems: (items) => http.post('/cart/items/bulk', { items }),
  updateItem: (itemId, changes) => http.patch(`/cart/items/${encodeURIComponent(itemId)}`, changes),
  removeItem: (itemId) => http.delete(`/cart/items/${encodeURIComponent(itemId)}`),
  merge: (items) => http.post('/cart/merge', { items }),
  // Invitado: el backend calcula precios sin guardar nada.
  quote: (items) => http.post('/cart/quote', { items }),
}
