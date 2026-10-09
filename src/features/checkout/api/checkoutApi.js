import { http } from '@/services/api/apiClient'

export const checkoutApi = {
  // [{ id, label, description, price, estimatedDays, total }] — total calculado por el backend.
  getShippingOptions: (addressId) =>
    http.get('/checkout/shipping-options', { params: { addressId } }),
}
