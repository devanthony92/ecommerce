import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { renderApp } from '@/test/renderApp'

beforeEach(() => resetDb())

const orderCards = () => screen.findAllByRole('article')

describe('Pedidos y recompra', () => {
  it('historial con filtros por estado', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/pedidos', { as: 'wholesale' })
    expect(await orderCards()).toHaveLength(3)

    const filters = screen.getByRole('navigation', { name: 'Filtrar pedidos' })
    await user.click(within(filters).getByRole('link', { name: 'Entregados' }))
    await waitFor(async () => expect(await orderCards()).toHaveLength(2))

    await user.click(within(filters).getByRole('link', { name: 'En curso' }))
    await waitFor(async () => expect(await orderCards()).toHaveLength(1))
    expect(screen.getByRole('link', { name: 'PED-000118' })).toBeInTheDocument()
  })

  it('detalle: seguimiento y repetir pedido abre el carrito', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/pedidos/o-seed-3', { as: 'wholesale' })

    expect(await screen.findByRole('heading', { name: 'Pedido PED-000118' })).toBeInTheDocument()
    const timeline = screen.getByRole('list', { name: 'Seguimiento del pedido' })
    expect(within(timeline).getByText('Enviado').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    // Ya salió de bodega: no se puede cancelar.
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Repetir pedido PED-000118' }))
    expect(await screen.findByText(/Agregamos los productos de PED-000118/)).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Mi carrito' })).toBeInTheDocument()
  })

  it('cancelar un pedido pagado con motivo', async () => {
    const user = userEvent.setup()
    getDb().orders.push({
      ...getDb().orders[0],
      id: 'o-buyer-1',
      userId: 'u-buyer',
      number: 'PED-000200',
      status: 'PAID',
      createdAt: '2026-10-08T12:00:00Z',
    })
    save()
    renderApp('/cuenta/pedidos/o-buyer-1', { as: 'buyer' })

    await user.click(await screen.findByRole('button', { name: 'Cancelar pedido' }))
    const dialog = screen.getByRole('dialog', { name: 'Cancelar pedido PED-000200' })
    await user.selectOptions(within(dialog).getByLabelText('Motivo'), 'Ya no lo necesito')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByText('Este pedido fue cancelado.')).toBeInTheDocument()
    expect(screen.getByText('Motivo de cancelación: Ya no lo necesito')).toBeInTheDocument()
  })

  it('pedido rápido: buscar, armar la lista y agregar todo', async () => {
    const user = userEvent.setup()
    renderApp('/mayorista/pedido-rapido', { as: 'wholesale' })

    await user.type(await screen.findByLabelText('Nombre o referencia (SKU)'), 'gorra trucker')
    const results = await screen.findByRole('list', { name: 'Resultados' })
    const [firstAdd] = await within(results).findAllByRole('button', {
      name: /^Agregar Gorra trucker/,
    })
    const enabledAdd = within(results)
      .getAllByRole('button', { name: /^Agregar Gorra trucker/ })
      .find((button) => !button.disabled)
    await user.click(enabledAdd ?? firstAdd)

    const list = screen.getByRole('list', { name: 'Referencias del pedido' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Agregar todo al carrito' }))

    expect(await screen.findByText('Agregamos 1 referencia al carrito')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Mi carrito' })).toBeInTheDocument()
  })

  it('productos habituales: marcados con su cantidad y se agregan juntos', async () => {
    const user = userEvent.setup()
    renderApp('/mayorista/frecuentes', { as: 'wholesale' })

    const button = await screen.findByRole('button', { name: /^Agregar al carrito \(/ })
    const checked = screen.getAllByRole('checkbox').filter((box) => box.checked)
    expect(checked.length).toBeGreaterThan(0)
    expect(button).toHaveTextContent(`(${checked.length})`)

    await user.click(button)
    expect(
      await screen.findByText(new RegExp(`Agregamos ${checked.length} productos? al carrito`)),
    ).toBeInTheDocument()
  })
})
