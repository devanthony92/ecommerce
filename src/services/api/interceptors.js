import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { ApiError } from './ApiError'

let unauthorizedHandler = null

// AuthProvider registra aquí qué hacer ante un 401 (cerrar sesión local).
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function attachAuthToken(config) {
  const token = storage.get(STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export function toApiError(error) {
  if (!error.response) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'No pudimos conectar con el servidor. Revisa tu conexión.',
    })
  }

  const { status, data } = error.response
  const payload = data?.error ?? {}

  return new ApiError({
    status,
    code: payload.code,
    message: payload.message,
    details: payload.details,
  })
}

export function handleResponseError(error) {
  const apiError = toApiError(error)

  // Un 401 en /auth/* es "credenciales inválidas", no una sesión vencida.
  const isAuthEndpoint = error.config?.url?.startsWith('/auth/')
  if (apiError.status === 401 && !isAuthEndpoint && unauthorizedHandler) {
    unauthorizedHandler()
  }

  return Promise.reject(apiError)
}

export function setupInterceptors(client) {
  client.interceptors.request.use(attachAuthToken)
  client.interceptors.response.use((response) => response, handleResponseError)
}
