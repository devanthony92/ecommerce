import axios from 'axios'
import { setupInterceptors } from './interceptors'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  // Arrays como parámetros repetidos: ?size=M&size=L (contrato §7).
  paramsSerializer: { indexes: null },
  // Import dinámico: con VITE_USE_MOCKS=false los mocks no entran al bundle.
  ...(useMocks && {
    adapter: async (config) => (await import('./mocks/mockAdapter')).mockAdapter(config),
  }),
})

setupInterceptors(apiClient)

// Las funciones de features/*/api usan estos helpers y reciben solo `data`.
export const http = {
  get: (url, config) => apiClient.get(url, config).then((res) => res.data),
  post: (url, body, config) => apiClient.post(url, body, config).then((res) => res.data),
  put: (url, body, config) => apiClient.put(url, body, config).then((res) => res.data),
  patch: (url, body, config) => apiClient.patch(url, body, config).then((res) => res.data),
  delete: (url, config) => apiClient.delete(url, config).then((res) => res.data),
}
