import { screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'

const section = (name) => screen.getByRole('region', { name })

describe('Home', () => {
  it('comunica las dos propuestas y arma todas las secciones', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Desde una sola prenda' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Precios mayoristas para tu tienda' }),
    ).toBeInTheDocument()

    const promotions = await screen.findByRole('list', { name: 'Promociones' })
    expect(within(promotions).getAllByRole('link')).toHaveLength(3)

    expect(
      await within(section('Categorías')).findAllByRole('link', { name: /productos$/ }),
    ).toHaveLength(7)
    expect(await within(section('Destacados')).findAllByRole('article')).toHaveLength(4)
    // Las escalas por cantidad son solo para mayoristas.
    expect(screen.queryByRole('region', { name: 'Compra más, paga menos' })).not.toBeInTheDocument()
    // Los más vendidos cuelgan en el puesto del hero, cada uno con su precio.
    const stall = await screen.findByRole('list', { name: 'Lo más vendido' })
    expect(within(stall).getAllByRole('link', { name: /\$/ })).toHaveLength(4)
    expect(screen.queryByRole('region', { name: 'Los más vendidos' })).not.toBeInTheDocument()
    expect(section('Beneficios')).toBeInTheDocument()

    // Visitante: la invitación lleva a crear cuenta y volver a la solicitud.
    const cta = section('¿Revendes nuestros productos?')
    expect(within(cta).getByRole('link', { name: 'Crear cuenta y solicitar' })).toHaveAttribute(
      'href',
      '/registro?next=%2Fcuenta%2Fsolicitud-mayorista',
    )
  })

  it('el mayorista ve accesos a su panel y las ofertas por volumen', async () => {
    renderApp('/', { as: 'wholesale' })
    expect(
      (await screen.findAllByRole('link', { name: 'Ir a mi panel mayorista' })).length,
    ).toBeGreaterThan(0)
    expect(
      await within(section('Compra más, paga menos')).findAllByRole('list', {
        name: 'Precios por cantidad',
      }),
    ).toHaveLength(3)
  })
})

describe('Ofertas', () => {
  it('lista solo productos con precio de temporada y las demás promociones', async () => {
    renderApp('/ofertas')
    expect(await screen.findByRole('heading', { name: 'Ofertas', level: 1 })).toBeInTheDocument()
    expect(
      await screen.findByText('4 productos', { selector: '.catalog-view__count' }),
    ).toBeInTheDocument()
    const promotions = await screen.findByRole('list', { name: 'Promociones' })
    expect(within(promotions).getAllByRole('link')).toHaveLength(2)
  })
})
