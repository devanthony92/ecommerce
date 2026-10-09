import { http } from '@/services/api/apiClient'

export const authApi = {
  login: (credentials) => http.post('/auth/login', credentials),
  register: (data) => http.post('/auth/register', data),
  logout: () => http.post('/auth/logout'),
  getMe: () => http.get('/users/me'),
  forgotPassword: (email) => http.post('/auth/password/forgot', { email }),
  resetPassword: ({ token, password }) => http.post('/auth/password/reset', { token, password }),
}
