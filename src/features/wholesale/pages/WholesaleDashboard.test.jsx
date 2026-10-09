import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { products } from '@/services/api/mocks/fixtures/products'
import { renderApp } from '@/test/renderApp'

beforeEach(() => resetDb())

const levelCard = () => screen.getByRole('region', { name: 'Hola, Carlos' })

describe('Panel mayorista', () => {
  it('muestra nivel, compra acumulada, progreso, pedidos, ahorro y beneficios', async () => {
    renderApp('/mayorista', { as: 'wholesale' })

    expect(await screen.findByRole('heading', { name: 'Hola, Carlos' })).toBeInTheDocument()
    expect(within(levelCard()).getByText('Nivel ORO')).toBeInTheDocument()
    expect(within(levelCard()).getByText('12%')).toBeInTheDocument()
    expect(within(levelCard()).getByText(/3\.450\.000/)).toBeInTheDocument()
    expect(within(levelCard()).getByText(/1\.550\.000/)).toBeInTheDocument()
    expect(within(levelCard()).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '48')

    expect(await screen.findByRole('link', { name: 'PED-000118' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Ahorro generado' })).toBeInTheDocument()
    expect(screen.getByText('Acceso a preventas')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Accesos rápidos' })).toBeInTheDocument()
  })

  it('una compra grande lo sube de nivel y se refleja en el panel', async () => {
    const user = userEvent.setup()
    const bomber = products.find((item) => item.slug === 'chaqueta-bomber')
    const variant = bomber.variants.find((item) => item.stock >= 24)
    getDb().carts['u-wholesale'] = [{ id: 'ci-big', variantId: variant.id, quantity: 24 }]
    save()
    renderApp('/checkout', { as: 'wholesale' })

    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: /^PSE/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }))
    await user.click(screen.getByRole('button', { name: /Confirmar pedido/ }))

    expect(await screen.findByText(/Subiste a nivel/)).toHaveTextContent('PLATINO')

    await user.click(
      within(document.querySelector('.site-header')).getByRole('link', { name: /Mayorista/ }),
    )
    expect(
      await within(await screen.findByRole('region', { name: 'Hola, Carlos' })).findByText(
        'Nivel PLATINO',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Estás en el nivel más alto del programa.')).toBeInTheDocument()
  })

  it('el catálogo mayorista muestra todas las escalas con su nivel', async () => {
    renderApp('/mayorista/catalogo', { as: 'wholesale' })
    expect(await screen.findByRole('heading', { name: 'Catálogo mayorista' })).toBeInTheDocument()
    expect(await screen.findByText(/nivel ORO \(−12%\)/)).toBeInTheDocument()
    expect(
      (await screen.findAllByRole('list', { name: 'Precios por cantidad' })).length,
    ).toBeGreaterThan(0)
  })

  it('beneficios: nivel actual resaltado entre todos los niveles', async () => {
    renderApp('/mayorista/beneficios', { as: 'wholesale' })
    expect(await screen.findByRole('region', { name: 'Tu nivel: ORO' })).toBeInTheDocument()
    expect(await screen.findByText('Tu nivel')).toBeInTheDocument()
  })
})
