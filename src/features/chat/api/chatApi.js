import { http } from '@/services/api/apiClient'

export const chatApi = {
  status: () => http.get('/chat/status'),
  // Gemini puede tardar más que el timeout general de la API.
  send: (body) => http.post('/chat/messages', body, { timeout: 30000 }),
}
