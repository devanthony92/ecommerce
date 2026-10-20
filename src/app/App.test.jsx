import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

// Credenciales semilla del backend simulado (src/services/api/mocks/db.js).
async function loginAs(email, password = 'Trama1234') {
  const user = userEvent.setup()
  const dialog = await screen.findByRole('dialog', { name: 'Iniciar sesión' })
  await user.type(within(dialog).getByLabelText(/^Correo/), email)
  await user.type(within(dialog).getByLabelText(/^Contraseña/), password)
  await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))
}

describe('App', () => {
  it('renderiza la home', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 }),
    ).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', async () => {
    renderApp('/no-existe')
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('pide iniciar sesión y vuelve a la ruta protegida tras ingresar', async () => {
    renderApp('/cuenta')
    await loginAs('comprador@trama.test')

    expect(await screen.findByRole('heading', { name: /Hola, Laura/ })).toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    renderApp('/ingresar')
    await loginAs('nadie@trama.test', 'incorrecta')

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

  it('el mayorista con sesión ve el acceso a su panel', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    await loginAs('mayorista@trama.test')

    const header = within(document.querySelector('.site-header'))
    await user.click(await header.findByRole('link', { name: /Mi panel/ }))
    expect(await screen.findByRole('heading', { name: 'Hola, Carlos' })).toBeInTheDocument()
  })
})
