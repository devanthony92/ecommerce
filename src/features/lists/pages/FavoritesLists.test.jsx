import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb } from '@/services/api/mocks/db'
import { renderApp } from '@/test/renderApp'

beforeEach(() => resetDb())

describe('Favoritos', () => {
  it('sin sesión, el corazón pide ingresar y luego guarda el favorito', async () => {
    const user = userEvent.setup()
    renderApp('/catalogo/gorras')

    await user.click(
      await screen.findByRole('button', { name: 'Agregar Gorra béisbol a favoritos' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Iniciar sesión' })
    await user.type(within(dialog).getByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByRole('button', { name: 'Quitar Gorra béisbol de favoritos' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(getDb().favorites['u-buyer']).toContain('p-gorra-beisbol'))
  })

  it('la página de favoritos lista y permite quitar', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/favoritos', { as: 'wholesale' })

    expect(await screen.findAllByRole('article')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Quitar Jean slim de favoritos' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2))
  })
})

describe('Listas de compra', () => {
  it('ver una lista, agregarla al carrito, renombrarla y eliminarla', async () => {
    const user = userEvent.setup()
    renderApp('/cuenta/listas', { as: 'wholesale' })

    await user.click(await screen.findByRole('link', { name: 'Pedido mensual' }))
    const items = await screen.findByRole('list', { name: 'Productos de Pedido mensual' })
    expect(within(items).getAllByRole('article')).toHaveLength(4)

    await user.click(
      screen.getByRole('button', { name: 'Agregar la lista Pedido mensual al carrito' }),
    )
    expect(await screen.findByText(/Agregamos "Pedido mensual" al carrito/)).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Mi carrito' })).toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Renombrar' }))
    const rename = screen.getByRole('dialog', { name: 'Renombrar lista' })
    const input = within(rename).getByLabelText(/^Nombre de la lista/)
    await user.clear(input)
    await user.type(input, 'Surtido tienda')
    await user.click(within(rename).getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('heading', { name: 'Surtido tienda' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar lista' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Eliminar lista' })).getByRole('button', {
        name: 'Eliminar',
      }),
    )
    expect(await screen.findByRole('heading', { name: 'Aún no tienes listas' })).toBeInTheDocument()
  })

  it('desde el producto se guarda en una lista nueva', async () => {
    const user = userEvent.setup()
    renderApp('/producto/camiseta-basica', { as: 'buyer' })

    const sizes = await screen.findByRole('group', { name: /^Talla/ })
    await user.click(
      within(sizes)
        .getAllByRole('radio')
        .find((radio) => !radio.disabled),
    )
    await user.click(screen.getByRole('button', { name: 'Guardar en lista' }))

    const dialog = screen.getByRole('dialog', { name: 'Guardar en una lista' })
    // El comprador no tiene listas: "Nueva lista" viene elegida.
    expect(await within(dialog).findByRole('radio', { name: 'Nueva lista' })).toBeChecked()
    await user.type(within(dialog).getByLabelText('Nombre de la nueva lista'), 'Mi tienda')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Guardado en "Mi tienda"')).toBeInTheDocument()
    expect(getDb().lists['u-buyer'][0].items).toHaveLength(1)
  })
})
