import { http } from '@/services/api/apiClient'

export const catalogApi = {
  getCategories: () => http.get('/categories'),
  getProducts: (params) => http.get('/products', { params }),
  lookupVariants: (q) => http.get('/products/lookup', { params: { q } }),
  getProduct: (slug) => http.get(`/products/${encodeURIComponent(slug)}`),
}
