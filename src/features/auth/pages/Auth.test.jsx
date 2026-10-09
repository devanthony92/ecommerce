import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetDb } from '@/services/api/mocks/db'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { renderApp } from '@/test/renderApp'

const submit = (name) => screen.getByRole('button', { name })

beforeEach(() => resetDb())

describe('Autenticación', () => {
  it('login: valida antes de enviar y enfoca el primer error', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    await user.click(await screen.findByRole('button', { name: 'Ingresar' }))

    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Correo/)).toHaveFocus()
  })

  it('login: credenciales inválidas no se confunden con sesión vencida', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    await user.type(await screen.findByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(screen.getByLabelText(/^Contraseña/), 'otraClave1')
    await user.click(submit('Ingresar'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(screen.queryByText('Tu sesión expiró')).not.toBeInTheDocument()
  })

  it('el campo de contraseña se puede mostrar', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    const password = await screen.findByLabelText(/^Contraseña/)
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('registro: errores del cliente y del backend por campo, luego crea la cuenta', async () => {
    const user = userEvent.setup()
    renderApp('/registro')

    await user.type(await screen.findByLabelText(/^Nombre/), 'Ana Ruiz')
    await user.type(screen.getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(screen.getByLabelText(/^Contraseña/), 'trama2026')
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'trama2027')
    await user.click(submit('Crear cuenta'))
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(screen.getByText('Debes aceptar los términos para crear la cuenta.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/^Confirmar contraseña/))
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'trama2026')
    await user.click(screen.getByRole('checkbox', { name: /Acepto los términos/ }))
    await user.click(submit('Crear cuenta'))

    // El backend rechaza el correo y el error queda junto al campo, con foco.
    expect(await screen.findByText(/Ya existe una cuenta con ese correo/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Correo/)).toHaveFocus()

    await user.clear(screen.getByLabelText(/^Correo/))
    await user.type(screen.getByLabelText(/^Correo/), 'ana@trama.test')
    await user.click(submit('Crear cuenta'))
    expect(await screen.findByRole('heading', { name: 'Hola, Ana Ruiz' })).toBeInTheDocument()
  })

  it('recuperar y restablecer la contraseña', async () => {
    const user = userEvent.setup()
    renderApp('/recuperar-contrasena')

    await user.type(await screen.findByLabelText(/^Correo de tu cuenta/), 'comprador@trama.test')
    await user.click(submit('Enviar enlace'))
    expect(await screen.findByRole('heading', { name: 'Revisa tu correo' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'abrir el enlace de restablecimiento' }))
    await user.type(
      await screen.findByLabelText(/^Nueva contraseña/, { selector: 'input' }),
      'nueva2026',
    )
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'nueva2026')
    await user.click(submit('Guardar contraseña'))

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument()
    await user.type(await screen.findByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(screen.getByLabelText(/^Contraseña/), 'nueva2026')
    await user.click(submit('Ingresar'))
    expect(await screen.findByRole('heading', { name: /Hola, Laura/ })).toBeInTheDocument()
  })

  it('el login en modal no saca al usuario de la página', async () => {
    const user = userEvent.setup()
    renderApp('/catalogo')
    await user.click(screen.getByRole('button', { name: 'Ingresar a mi cuenta' }))

    const dialog = screen.getByRole('dialog', { name: 'Ingresa a tu cuenta' })
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(within(dialog).getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Hola, Laura')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi cuenta' })).toBeInTheDocument()
  })

  it('con un token vencido avisa y pide ingresar de nuevo', async () => {
    storage.set(STORAGE_KEYS.token, 'mock-token-u-borrado')
    renderApp('/cuenta')
    expect(await screen.findByText('Tu sesión expiró')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('cerrar sesión lleva al inicio', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta', { as: 'buyer' })
    const account = await screen.findByRole('navigation', { name: 'Mi cuenta' })
    await user.click(within(account.parentElement).getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('Cerraste sesión')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Compra individual o por volumen' }),
    ).toBeInTheDocument()
  })

  it('después de cerrar sesión, otra ruta privada pide ingresar', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta', { as: 'buyer' })
    const account = await screen.findByRole('navigation', { name: 'Mi cuenta' })
    await user.click(within(account.parentElement).getByRole('button', { name: 'Cerrar sesión' }))
    await screen.findByRole('heading', { name: 'Compra individual o por volumen' })

    // El acceso a favoritos del header (el footer tiene otro enlace con el mismo nombre).
    await user.click(
      within(document.querySelector('.site-header')).getByRole('link', { name: 'Favoritos' }),
    )
    expect(await screen.findByText('Ingresa a tu cuenta para continuar.')).toBeInTheDocument()
  })
})
