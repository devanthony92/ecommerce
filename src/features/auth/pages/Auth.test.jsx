import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetDb } from '@/services/api/mocks/db'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { renderApp } from '@/test/renderApp'

const loginDialog = () => screen.findByRole('dialog', { name: 'Iniciar sesión' })
const header = () => within(document.querySelector('.site-header'))

beforeEach(() => resetDb())

describe('Autorización', () => {
  it('sin sesión el header ofrece iniciar sesión; con sesión, cerrarla', async () => {
    const { unmount } = renderApp('/')
    expect(await header().findByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(header().queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
    unmount()

    renderApp('/', { as: 'buyer' })
    expect(await header().findByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(header().queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('inicio de sesión: valida en cada tecla y el botón espera a que todo sea válido', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    const dialog = await loginDialog()
    const submit = within(dialog).getByRole('button', { name: 'Iniciar sesión' })
    expect(submit).toBeDisabled()

    await user.type(within(dialog).getByLabelText(/^Correo/), 'laura@')
    expect(within(dialog).getByText('Ingresa un correo válido.')).toBeInTheDocument()
    // La contraseña aún no se toca: todavía no muestra error.
    expect(within(dialog).queryByText('Ingresa tu contraseña.')).not.toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/^Correo/), 'trama.test')
    expect(within(dialog).queryByText('Ingresa un correo válido.')).not.toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'x')
    expect(submit).toBeEnabled()
  })

  it('credenciales inválidas: error encima del botón, sin confundirlo con sesión vencida', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    const dialog = await loginDialog()
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'otraClave1')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos.',
    )
    expect(screen.queryByText('Tu sesión expiró')).not.toBeInTheDocument()
  })

  it('el campo de contraseña se puede mostrar', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    const dialog = await loginDialog()
    const password = within(dialog).getByLabelText(/^Contraseña/)
    expect(password).toHaveAttribute('type', 'password')
    await user.click(within(dialog).getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('registro: valida en vivo, muestra el error del backend y ofrece iniciar sesión', async () => {
    const user = userEvent.setup()
    renderApp('/registro')
    let dialog = await screen.findByRole('dialog', { name: 'Registrarse' })
    const submit = within(dialog).getByRole('button', { name: 'Registrarse' })

    await user.type(within(dialog).getByLabelText(/^Nombre/), 'Ana Ruiz')
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'trama2026')
    await user.type(within(dialog).getByLabelText(/^Confirmar contraseña/), 'trama2027')
    expect(within(dialog).getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.clear(within(dialog).getByLabelText(/^Confirmar contraseña/))
    await user.type(within(dialog).getByLabelText(/^Confirmar contraseña/), 'trama2026')
    await user.click(within(dialog).getByRole('checkbox', { name: /Acepto los términos/ }))
    expect(submit).toBeEnabled()
    await user.click(submit)

    // El backend rechaza el correo y el error queda junto al campo, con foco.
    expect(
      await within(dialog).findByText(/Ya existe una cuenta con ese correo/),
    ).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/^Correo/)).toHaveFocus()

    await user.clear(within(dialog).getByLabelText(/^Correo/))
    await user.type(within(dialog).getByLabelText(/^Correo/), 'ana@trama.test')
    await user.click(submit)

    // El registro no inicia sesión: un aviso ofrece ingresar.
    dialog = await screen.findByRole('dialog', { name: 'Registro completado' })
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    dialog = await loginDialog()
    await user.type(within(dialog).getByLabelText(/^Correo/), 'ana@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'trama2026')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('Hola, Ana')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('recuperar y restablecer la contraseña', async () => {
    const user = userEvent.setup()
    renderApp('/recuperar-contrasena')

    await user.type(await screen.findByLabelText(/^Correo de tu cuenta/), 'comprador@trama.test')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }))
    expect(await screen.findByRole('heading', { name: 'Revisa tu correo' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'abrir el enlace de restablecimiento' }))
    await user.type(
      await screen.findByLabelText(/^Nueva contraseña/, { selector: 'input' }),
      'nueva2026',
    )
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'nueva2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument()
    const dialog = await loginDialog()
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'nueva2026')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('Hola, Laura')).toBeInTheDocument()
  })

  it('iniciar sesión desde el header no saca al usuario de la página', async () => {
    const user = userEvent.setup()
    renderApp('/catalogo')
    await user.click(await header().findByRole('button', { name: 'Iniciar sesión' }))

    const dialog = await loginDialog()
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Hola, Laura')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(header().getByRole('link', { name: 'Mi cuenta' })).toBeInTheDocument()
  })

  it('una ruta protegida sin sesión vuelve al inicio, abre el modal y luego sigue', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/pedidos')

    const dialog = await loginDialog()
    expect(within(dialog).getByText('Inicia sesión para continuar.')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 }),
    ).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Pedidos', level: 1 })).toBeInTheDocument()
  })

  it('el token se guarda en localStorage al iniciar sesión', async () => {
    const user = userEvent.setup()
    renderApp('/ingresar')
    const dialog = await loginDialog()
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    await screen.findByText('Hola, Laura')
    expect(storage.get(STORAGE_KEYS.token)).toBe('mock-token-u-buyer')
  })

  it('con un token vencido avisa y pide ingresar de nuevo', async () => {
    storage.set(STORAGE_KEYS.token, 'mock-token-u-borrado')
    renderApp('/cuenta')
    expect(await screen.findByText('Tu sesión expiró')).toBeInTheDocument()
    expect(await loginDialog()).toBeInTheDocument()
  })

  it('cerrar sesión lleva al inicio', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta', { as: 'buyer' })
    const account = await screen.findByRole('navigation', { name: 'Mi cuenta' })
    await user.click(within(account.parentElement).getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('Cerraste sesión')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('después de cerrar sesión, otra ruta privada pide ingresar', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta', { as: 'buyer' })
    const account = await screen.findByRole('navigation', { name: 'Mi cuenta' })
    await user.click(within(account.parentElement).getByRole('button', { name: 'Cerrar sesión' }))
    await screen.findByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 })

    await user.click(header().getByRole('link', { name: 'Favoritos' }))
    const dialog = await loginDialog()
    expect(within(dialog).getByText('Inicia sesión para continuar.')).toBeInTheDocument()
  })
})
