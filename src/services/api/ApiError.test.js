import { ApiError } from './ApiError'

describe('ApiError.userMessage', () => {
  it('muestra el mensaje de negocio de un 4xx', () => {
    const error = new ApiError({ status: 409, message: 'No hay stock suficiente.' })
    expect(error.userMessage).toBe('No hay stock suficiente.')
  })

  it('muestra el mensaje de conexión cuando no hay respuesta', () => {
    const error = new ApiError({ status: 0, message: 'No pudimos conectar con el servidor.' })
    expect(error.userMessage).toBe('No pudimos conectar con el servidor.')
  })

  it('no expone el detalle de un 5xx', () => {
    const error = new ApiError({ status: 500, message: 'IntegrityError: duplicate key' })
    expect(error.userMessage).toBe(
      'Tuvimos un problema de nuestro lado. Intenta de nuevo en un momento.',
    )
  })
})
