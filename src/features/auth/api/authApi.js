import { http } from '@/services/api/apiClient'

// Registro, ingreso y usuario actual están en utils/MainApi.js.
export const authApi = {
  logout: () => http.post('/auth/logout'),
  forgotPassword: (email) => http.post('/auth/password/forgot', { email }),
  resetPassword: ({ token, password }) => http.post('/auth/password/reset', { token, password }),
}
