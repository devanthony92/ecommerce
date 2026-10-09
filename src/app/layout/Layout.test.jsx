import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

describe('Shell de la tienda', () => {
  it('muestra las categorías del backend en la navegación', async () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Categorías' })
    expect(await within(nav).findByRole('link', { name: 'Camisetas' })).toHaveAttribute(
      'href',
      '/catalogo/camisetas',
    )
  })

  it('abre el carrito vacío y lo cierra con ESC', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const cartButton = screen.getByRole('button', { name: 'Carrito vacío' })
    expect(cartButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(cartButton)
    const drawer = screen.getByRole('dialog', { name: 'Mi carrito' })
    expect(within(drawer).getByText('Tu carrito está vacío')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(cartButton).toHaveFocus()
  })

  it('el menú móvil lista categorías y se cierra al navegar', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    const menu = screen.getByRole('dialog', { name: 'Menú' })
    await user.click(await within(menu).findByRole('link', { name: 'Jeans' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByRole('heading', { name: 'Jeans' })).toBeInTheDocument()
  })

  it('la búsqueda lleva a /buscar con la consulta', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const search = screen.getByRole('searchbox', { name: 'Buscar productos' })
    await user.type(search, 'camiseta negra{Enter}')

    expect(
      await screen.findByRole('heading', { name: 'Resultados para “camiseta negra”' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar productos' })).toHaveValue(
      'camiseta negra',
    )
  })

  it('la cuenta de comprador ofrece la solicitud mayorista', async () => {
    renderApp('/cuenta', { as: 'buyer' })
    const nav = await screen.findByRole('navigation', { name: 'Mi cuenta' })
    expect(within(nav).getByRole('link', { name: 'Resumen' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Ser mayorista' })).toBeInTheDocument()
  })

  it('el mayorista ve su panel con navegación propia', async () => {
    renderApp('/mayorista', { as: 'wholesale' })
    const nav = await screen.findByRole('navigation', { name: 'Panel mayorista' })
    expect(within(nav).getByRole('link', { name: 'Pedido rápido' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mayorista/ })).toHaveAttribute('href', '/mayorista')
  })

  it('las rutas pendientes muestran el aviso de construcción', async () => {
    renderApp('/cuenta/pedidos', { as: 'buyer' })
    expect(await screen.findByRole('heading', { name: 'Pedidos' })).toBeInTheDocument()
    expect(screen.getByText('Esta página se implementa en la fase 12.')).toBeInTheDocument()
  })
})
