import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetDb } from '@/services/api/mocks/db'
import { renderApp } from '@/test/renderApp'

beforeEach(() => resetDb())

async function fillRequestForm(user) {
  await user.type(await screen.findByLabelText(/^Nombre comercial/), 'Tienda Laura')
  await user.type(screen.getByLabelText(/^Razón social/), 'Laura Gómez')
  await user.type(screen.getByLabelText(/^NIT o cédula/), '1020304050')
  await user.selectOptions(screen.getByLabelText(/^Tipo de negocio/), 'ONLINE_STORE')
  await user.type(screen.getByLabelText(/^Celular/), '3001112233')
  await user.type(screen.getByLabelText(/^Ciudad/), 'Bogotá')
  await user.type(screen.getByLabelText(/^Dirección del negocio/), 'Calle 80 # 20-10')
  await user.selectOptions(screen.getByLabelText(/^Volumen de compra/), '1M_5M')
  await user.click(await screen.findByRole('checkbox', { name: 'Camisetas' }))
}

const statusCard = () => screen.getByRole('region', { name: 'Tu solicitud' })
const simulator = () => screen.getByRole('complementary', { name: /Simulador de revisión/ })

describe('Programa mayorista', () => {
  it('el comprador envía la solicitud y ve su estado', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/solicitud-mayorista', { as: 'buyer' })

    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }))
    expect(screen.getByText('Ingresa el nombre de tu negocio.')).toBeInTheDocument()
    expect(screen.getByText('Elige al menos una categoría.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nombre comercial/)).toHaveFocus()

    await fillRequestForm(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    expect(
      await screen.findByText('Solicitud enviada', { selector: '.toast__title' }),
    ).toBeInTheDocument()
    expect(within(statusCard()).getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Tienda Laura · Laura Gómez')).toBeInTheDocument()
    // La navegación de la cuenta cambia a "Solicitud mayorista".
    const nav = screen.getByRole('navigation', { name: 'Mi cuenta' })
    expect(within(nav).getByRole('link', { name: 'Solicitud mayorista' })).toBeInTheDocument()
  })

  it('al aprobarse cambia el rol, los permisos y el acceso al panel', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/solicitud-mayorista', { as: 'buyer' })
    await fillRequestForm(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    await screen.findByText('Solicitud enviada', { selector: '.toast__title' })

    await user.click(within(simulator()).getByRole('button', { name: 'Aprobar' }))

    expect(
      await within(statusCard()).findByText('Aprobada', { selector: '.badge' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Ir a mi panel mayorista' }))
    expect(await screen.findByRole('navigation', { name: 'Panel mayorista' })).toBeInTheDocument()
  })

  it('si se rechaza muestra el motivo y permite reenviar con los datos', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/solicitud-mayorista', { as: 'buyer' })
    await fillRequestForm(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    await screen.findByText('Solicitud enviada', { selector: '.toast__title' })

    await user.click(within(simulator()).getByRole('button', { name: 'Rechazar' }))
    expect(await screen.findByText(/Motivo: No pudimos verificar el NIT/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Enviar nueva solicitud' }))
    expect(screen.getByLabelText(/^Nombre comercial/)).toHaveValue('Tienda Laura')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    const card = await screen.findByRole('region', { name: 'Tu solicitud' })
    expect(within(card).getByText('Pendiente')).toBeInTheDocument()
  })

  it('la página pública explica el programa y adapta la invitación', async () => {
    renderApp('/mayoristas')
    expect(
      await screen.findByRole('heading', { name: 'Compra por mayor y gana más en tu negocio' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear cuenta y solicitar' })).toHaveAttribute(
      'href',
      '/registro?next=%2Fcuenta%2Fsolicitud-mayorista',
    )
    const levels = await screen.findByText('PLATINO')
    expect(levels).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('el mayorista ve su solicitud aprobada y su panel en la invitación', async () => {
    renderApp('/mayoristas', { as: 'wholesale' })
    expect(await screen.findByRole('link', { name: 'Ir a mi panel mayorista' })).toHaveAttribute(
      'href',
      '/mayorista',
    )
  })
})
