import { http } from '@/services/api/apiClient'

export const catalogApi = {
  getCategories: () => http.get('/categories'),
  getProducts: (params) => http.get('/products', { params }),
}
