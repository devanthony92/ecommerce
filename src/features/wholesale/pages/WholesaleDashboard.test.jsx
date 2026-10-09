import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { products } from '@/services/api/mocks/fixtures/products'
import { renderApp } from '@/test/renderApp'
import { formatMoney } from '@/utils/formatMoney'

beforeEach(() => resetDb())

const summaryCard = () => screen.getByRole('region', { name: 'Hola, Carlos' })

describe('Panel mayorista', () => {
  it('muestra compra acumulada, pedido mínimo, pedidos, ahorro y beneficios', async () => {
    renderApp('/mayorista', { as: 'wholesale' })

    expect(await screen.findByRole('heading', { name: 'Hola, Carlos' })).toBeInTheDocument()
    expect(within(summaryCard()).getByText('Cuenta mayorista')).toBeInTheDocument()
    expect(within(summaryCard()).getByText(/3\.450\.000/)).toBeInTheDocument()
    expect(within(summaryCard()).getByText(/120\.000/)).toBeInTheDocument()

    expect(await screen.findByRole('link', { name: 'PED-000118' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Ahorro generado' })).toBeInTheDocument()
    expect(screen.getByText('Asesor comercial')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Accesos rápidos' })).toBeInTheDocument()
  })

  it('una compra suma a la compra acumulada del panel', async () => {
    const user = userEvent.setup()
    const bomber = products.find((item) => item.slug === 'chaqueta-bomber')
    const variant = bomber.variants.find((item) => item.stock >= 24)
    getDb().carts['u-wholesale'] = [{ id: 'ci-big', variantId: variant.id, quantity: 24 }]
    save()
    renderApp('/checkout', { as: 'wholesale' })

    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: /^Pago contra entrega/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }))
    await user.click(screen.getByRole('button', { name: /Confirmar pedido/ }))
    expect(
      await screen.findByRole('heading', { name: '¡Gracias por tu compra!' }),
    ).toBeInTheDocument()

    // toHaveTextContent normaliza el espacio duro que usa Intl en "$ 1.000".
    const expected = formatMoney(3450000 + getDb().orders.at(-1).summary.total).replace(/\s/g, ' ')
    await user.click(
      within(document.querySelector('.site-header')).getByRole('link', { name: /Mayorista/ }),
    )
    expect(await screen.findByRole('region', { name: 'Hola, Carlos' })).toHaveTextContent(expected)
  })

  it('el catálogo mayorista muestra todas las escalas', async () => {
    renderApp('/mayorista/catalogo', { as: 'wholesale' })
    expect(await screen.findByRole('heading', { name: 'Catálogo mayorista' })).toBeInTheDocument()
    expect(
      (await screen.findAllByRole('list', { name: 'Precios por cantidad' })).length,
    ).toBeGreaterThan(0)
  })

  it('beneficios: lista del programa y pedido mínimo', async () => {
    renderApp('/mayorista/beneficios', { as: 'wholesale' })
    expect(await screen.findByRole('heading', { name: 'Beneficios', level: 1 })).toBeInTheDocument()
    expect(await screen.findByText('Pedido rápido por referencia')).toBeInTheDocument()
    expect(screen.getByText(/^Pedido mínimo:/)).toHaveTextContent(/120\.000/)
  })
})
