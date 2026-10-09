import { http } from '@/services/api/apiClient'

export const pricingApi = {
  // items: [{ variantId, quantity }] → { items: [{ variantId, pricing }] }
  quote: (items) => http.post('/pricing/quote', { items }),
}
