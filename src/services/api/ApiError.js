// Error normalizado que reciben hooks y componentes.
// Forma del backend: { error: { code, message, details } }
export class ApiError extends Error {
  constructor({ status = 0, code = 'UNKNOWN_ERROR', message, details = null }) {
    super(message ?? 'Ocurrió un error inesperado.')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  get isNetworkError() {
    return this.status === 0
  }
}
