import { http } from '@/services/api/apiClient'

export const wholesaleApi = {
  getProgram: () => http.get('/wholesale/program'),
  getProfile: () => http.get('/wholesale/profile'),
  getFrequentProducts: () => http.get('/wholesale/frequent-products'),
  getMyRequest: () => http.get('/wholesale/requests/me'),
  submitRequest: (data) => http.post('/wholesale/requests', data),
  // SOLO DEMO (backend simulado): simula la decisión del administrador.
  simulateReview: (status) => http.post('/_dev/wholesale-review', { status }),
}
