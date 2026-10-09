import { http } from '@/services/api/apiClient'

export const promotionsApi = {
  active: () => http.get('/promotions/active'),
}
