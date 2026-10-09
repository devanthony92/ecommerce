import { http } from '@/services/api/apiClient'

const base = (id) => `/lists/${encodeURIComponent(id)}`

export const listsApi = {
  list: () => http.get('/lists'),
  get: (id) => http.get(base(id)),
  create: (name) => http.post('/lists', { name }),
  rename: ({ id, name }) => http.patch(base(id), { name }),
  remove: (id) => http.delete(base(id)),
  addItem: ({ listId, variantId, quantity }) =>
    http.post(`${base(listId)}/items`, { variantId, quantity }),
  updateItem: ({ listId, itemId, quantity }) =>
    http.patch(`${base(listId)}/items/${encodeURIComponent(itemId)}`, { quantity }),
  removeItem: ({ listId, itemId }) =>
    http.delete(`${base(listId)}/items/${encodeURIComponent(itemId)}`),
  // → Cart; lo agotado viene en warnings.
  addToCart: (id) => http.post(`${base(id)}/add-to-cart`),
}
