import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { renderApp } from '@/test/renderApp'

beforeEach(() => resetDb())

const card = (title) => screen.getByRole('region', { name: title })

describe('Cuenta del comprador', () => {
  it('dashboard: pedidos, invitación mayorista y recomendados', async () => {
    getDb().orders.push({
      id: 'o-test',
      userId: 'u-buyer',
      number: 'PED-000999',
      createdAt: '2026-10-01T15:00:00Z',
      status: 'SHIPPED',
      items: [],
      summary: {
        itemsCount: 6,
        subtotal: 210000,
        discountTotal: 22800,
        shipping: 0,
        total: 187200,
      },
    })
    save()
    renderApp('/cuenta', { as: 'buyer' })

    expect(await screen.findByRole('heading', { name: 'Hola, Laura Gómez' })).toBeInTheDocument()
    const orders = card('Pedidos recientes')
    expect(await within(orders).findByRole('link', { name: 'PED-000999' })).toBeInTheDocument()
    expect(within(orders).getByText('Enviado')).toBeInTheDocument()

    expect(
      within(card('Precios mayoristas')).getByRole('link', { name: 'Solicitar cuenta mayorista' }),
    ).toBeInTheDocument()
    expect(await within(card('Te puede interesar')).findAllByRole('article')).toHaveLength(4)
  })

  it('perfil: valida y guarda los datos', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/perfil', { as: 'buyer' })

    const phone = await screen.findByLabelText(/^Celular/)
    await user.clear(phone)
    await user.type(phone, '123')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Celular de 10 dígitos que empiece por 3.')).toBeInTheDocument()

    await user.clear(phone)
    await user.type(phone, '3109998877')
    await user.clear(screen.getByLabelText(/^Nombre/))
    await user.type(screen.getByLabelText(/^Nombre/), 'Laura María Gómez')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Datos actualizados')).toBeInTheDocument()
    expect(getDb().users.find((u) => u.id === 'u-buyer').name).toBe('Laura María Gómez')
  })

  it('perfil: cambio de contraseña con error del backend en el campo', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/perfil', { as: 'buyer' })

    await user.type(await screen.findByLabelText(/^Contraseña actual/), 'incorrecta1')
    await user.type(screen.getByLabelText(/^Nueva contraseña/), 'nueva2026')
    await user.type(screen.getByLabelText(/^Confirmar nueva contraseña/), 'nueva2026')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Contraseña actual/)).toHaveFocus()

    await user.clear(screen.getByLabelText(/^Contraseña actual/))
    await user.type(screen.getByLabelText(/^Contraseña actual/), 'Trama1234')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Contraseña actual/)).toHaveValue('')
  })

  it('direcciones: agregar, hacer predeterminada y eliminar con confirmación', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/direcciones', { as: 'wholesale' })

    expect(await screen.findByRole('heading', { name: 'Tienda' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar dirección' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva dirección' })
    await user.type(within(dialog).getByLabelText(/^Nombre de la dirección/), 'Bodega')
    await user.type(within(dialog).getByLabelText(/^Quién recibe/), 'Carlos Pérez')
    await user.type(within(dialog).getByLabelText(/^Celular/), '3004445566')
    await user.selectOptions(within(dialog).getByLabelText(/^Departamento/), 'Antioquia')
    await user.type(within(dialog).getByLabelText(/^Ciudad o municipio/), 'Itagüí')
    await user.type(within(dialog).getByLabelText(/^Dirección\s*\*?$/), 'Calle 50 # 40-10')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar dirección' }))

    expect(await screen.findByRole('heading', { name: 'Bodega' })).toBeInTheDocument()

    const bodega = screen.getByRole('heading', { name: 'Bodega' }).closest('article')
    await user.click(within(bodega).getByRole('button', { name: 'Hacer predeterminada' }))
    await waitFor(() => expect(within(bodega).getByText('Predeterminada')).toBeInTheDocument())

    const tienda = screen.getByRole('heading', { name: 'Tienda' }).closest('article')
    await user.click(within(tienda).getByRole('button', { name: 'Eliminar Tienda' }))
    const confirm = screen.getByRole('dialog', { name: 'Eliminar dirección' })
    // Lo destructivo nunca es el foco por defecto.
    expect(within(confirm).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await user.click(within(confirm).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Tienda' })).not.toBeInTheDocument(),
    )
  })
})
