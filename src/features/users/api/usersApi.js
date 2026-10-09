import { http } from '@/services/api/apiClient'

export const usersApi = {
  getAddresses: () => http.get('/users/me/addresses'),
  createAddress: (data) => http.post('/users/me/addresses', data),
  updateAddress: (id, data) => http.patch(`/users/me/addresses/${encodeURIComponent(id)}`, data),
  deleteAddress: (id) => http.delete(`/users/me/addresses/${encodeURIComponent(id)}`),
}
