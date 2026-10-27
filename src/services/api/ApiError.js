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

  // Los 4xx traen un mensaje de negocio pensado para la persona ("Sin stock").
  // Un 5xx o un error sin mensaje no se muestra tal cual.
  get userMessage() {
    if (this.isNetworkError || (this.status >= 400 && this.status < 500)) return this.message
    return 'Tuvimos un problema de nuestro lado. Intenta de nuevo en un momento.'
  }
}
