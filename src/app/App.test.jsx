import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

// Credenciales semilla del backend simulado (src/services/api/mocks/db.js).
async function loginAs(email) {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText(/^Correo/), email)
  await user.type(screen.getByLabelText(/^Contraseña/), 'Trama1234')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('App', () => {
  it('renderiza la home', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: 'Compra individual o por volumen' }),
    ).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', async () => {
    renderApp('/no-existe')
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('redirige al login y vuelve a la ruta protegida tras ingresar', async () => {
    renderApp('/cuenta')
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()

    await loginAs('comprador@trama.test')

    expect(await screen.findByRole('heading', { name: /Hola, Laura/ })).toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    renderApp('/ingresar')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/^Correo/), 'nadie@trama.test')
    await user.type(screen.getByLabelText(/^Contraseña/), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
  })

  it('bloquea el panel mayorista a un comprador', async () => {
    renderApp('/ingresar?next=/mayorista')
    await loginAs('comprador@trama.test')

    expect(
      await screen.findByRole('heading', { name: 'No tienes acceso a esta sección' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar cuenta mayorista' })).toBeInTheDocument()
  })

  it('lleva al mayorista a su panel', async () => {
    renderApp('/ingresar')
    await loginAs('mayorista@trama.test')

    expect(await screen.findByRole('heading', { name: /Panel mayorista/ })).toBeInTheDocument()
  })
})
