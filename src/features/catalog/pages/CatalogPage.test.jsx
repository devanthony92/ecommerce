import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

const sidebar = () => screen.getByRole('complementary', { name: 'Filtros' })
const productCount = (text) => screen.findByText(text, { selector: '.catalog-view__count' })

describe('Catálogo', () => {
  it('lista la primera página con paginación', async () => {
    renderApp('/catalogo')
    expect(await productCount('32 productos')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(12)

    const pagination = screen.getByRole('navigation', { name: 'Páginas de resultados' })
    expect(within(pagination).getByRole('link', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('cambia de página desde la paginación', async () => {
    const user = userEvent.setup()
    renderApp('/catalogo')
    await productCount('32 productos')

    await user.click(screen.getByRole('link', { name: 'Página 3' }))
    expect(await screen.findByRole('link', { name: 'Página 3' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    // 32 productos, 12 por página: la tercera tiene 8.
    expect(await screen.findAllByRole('article')).toHaveLength(8)
  })

  it('filtra por talla y permite quitar el filtro', async () => {
    const user = userEvent.setup()
    renderApp('/catalogo/jeans')
    expect(await productCount('5 productos')).toBeInTheDocument()

    await user.click(within(sidebar()).getByRole('checkbox', { name: '28' }))
    expect(screen.getByRole('button', { name: 'Quitar filtro Talla 28' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar filtro Talla 28' }))
    expect(within(sidebar()).getByRole('checkbox', { name: '28' })).not.toBeChecked()
  })

  it('muestra solo productos de la categoría', async () => {
    renderApp('/catalogo/gorras')
    expect(await screen.findByRole('heading', { name: 'Gorras' })).toBeInTheDocument()
    expect(await productCount('4 productos')).toBeInTheDocument()
  })

  it('avisa si la categoría no existe', async () => {
    renderApp('/catalogo/no-existe')
    expect(
      await screen.findByRole('heading', { name: 'Categoría no encontrada' }),
    ).toBeInTheDocument()
  })

  it('el mayorista ve su precio especial', async () => {
    renderApp('/catalogo/gorras', { as: 'wholesale' })
    await productCount('4 productos')
    expect(screen.getAllByText('Tu precio mayorista').length).toBeGreaterThan(0)
  })

  it('la búsqueda sin resultados ofrece volver al catálogo', async () => {
    renderApp('/buscar?q=zzzz')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos productos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todo el catálogo' })).toBeInTheDocument()
  })

  it('la búsqueda ignora tildes', async () => {
    renderApp('/buscar?q=rinonera')
    expect(await productCount('1 producto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Riñonera urbana' })).toBeInTheDocument()
  })
})
