import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { products } from '@/services/api/mocks/fixtures/products'
import { renderApp } from '@/test/renderApp'
import { redirectTo } from '@/utils/redirect'

// jsdom no navega a otros documentos: la salida a Mercado Pago se simula.
vi.mock('@/utils/redirect', () => ({ redirectTo: vi.fn() }))

function seedServerCart(userId, slug, quantity) {
  const product = products.find((item) => item.slug === slug)
  const variant = product.variants.find((item) => item.stock >= quantity)
  getDb().carts[userId] = [{ id: 'ci-test', variantId: variant.id, quantity }]
  save()
}

const step = (name) => screen.getByRole('heading', { name: new RegExp(name) }).closest('section')

beforeEach(() => {
  resetDb()
  vi.mocked(redirectTo).mockClear()
})

describe('Checkout', () => {
  it('comprador sin direcciones: crea una, elige envío y pago, y confirma', async () => {
    const user = userEvent.setup()
    seedServerCart('u-buyer', 'jean-slim', 2)
    renderApp('/checkout', { as: 'buyer' })

    // Paso 1: formulario con validación inmediata.
    const save = await screen.findByRole('button', { name: 'Guardar y continuar' })
    await user.click(save)
    expect(screen.getByText('Ingresa quién recibe.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nombre de la dirección/)).toHaveFocus()

    await user.type(screen.getByLabelText(/^Nombre de la dirección/), 'Casa')
    await user.type(screen.getByLabelText(/^Quién recibe/), 'Laura Gómez')
    await user.type(screen.getByLabelText(/^Celular/), '3001112233')
    await user.selectOptions(screen.getByLabelText(/^Departamento/), 'Antioquia')
    await user.type(screen.getByLabelText(/^Ciudad o municipio/), 'Medellín')
    await user.type(screen.getByLabelText(/^Dirección\s*\*?$/), 'Calle 10 # 20-30')
    await user.click(save)

    // Paso 2: opciones del backend (Medellín tiene express).
    await user.click(await screen.findByRole('radio', { name: /Recoger en bodega/ }))
    expect(screen.getByRole('radio', { name: /Envío express/ })).toBeInTheDocument()
    await user.click(within(step('Envío')).getByRole('button', { name: 'Continuar' }))

    // Paso 3: medio de pago.
    expect(screen.getByText(/nunca escribes datos bancarios/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Pago contra entrega/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }))

    // Paso 4: confirmar. 2 × 119.000 = 238.000, recogida gratis.
    await user.click(screen.getByRole('button', { name: /Confirmar pedido · \$\s238\.000/ }))

    expect(
      await screen.findByRole('heading', { name: '¡Gracias por tu compra!' }),
    ).toBeInTheDocument()
    expect(screen.getByText('PED-000121')).toBeInTheDocument()
    expect(screen.getByText('En preparación')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Carrito vacío' })).toBeInTheDocument()
  })

  it('mayorista con dirección guardada: paga con Mercado Pago', async () => {
    const user = userEvent.setup()
    seedServerCart('u-wholesale', 'camiseta-basica', 12)
    renderApp('/checkout', { as: 'wholesale' })

    // La dirección predeterminada ya viene elegida.
    expect(await screen.findByRole('radio', { name: /Tienda · Carlos Pérez/ })).toBeChecked()
    await user.click(
      within(step('Dirección de entrega')).getByRole('button', { name: 'Continuar' }),
    )

    // Envío estándar gratis (12 × 27.000 = 324.000 ≥ 120.000).
    const standard = await screen.findByRole('radio', { name: /Envío estándar/ })
    expect(standard).toBeChecked()
    expect(standard.closest('label')).toHaveTextContent('Gratis')
    await user.click(within(step('Envío')).getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('radio', { name: /^Mercado Pago/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }))
    await user.click(screen.getByRole('button', { name: /Confirmar pedido/ }))

    // Sale hacia Mercado Pago, que devuelve a la confirmación del pedido.
    expect(
      await screen.findByRole('heading', { name: 'Te llevamos a Mercado Pago' }),
    ).toBeInTheDocument()
    const order = getDb().orders.at(-1)
    expect(redirectTo).toHaveBeenCalledWith(`/checkout/confirmacion/${order.id}?status=approved`)
    expect(order.status).toBe('PAID')
  })

  it('al volver de Mercado Pago muestra el pedido pagado', async () => {
    renderApp('/checkout/confirmacion/o-seed-1?status=approved', { as: 'wholesale' })
    expect(
      await screen.findByRole('heading', { name: '¡Gracias por tu compra!' }),
    ).toBeInTheDocument()
  })

  it('pago rechazado: el pedido queda pendiente y se puede reintentar', async () => {
    const user = userEvent.setup()
    getDb().orders.find((order) => order.id === 'o-seed-1').status = 'PENDING_PAYMENT'
    save()
    renderApp('/checkout/confirmacion/o-seed-1?status=rejected', { as: 'wholesale' })

    expect(
      await screen.findByRole('heading', { name: 'Tu pedido está pendiente de pago' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Mercado Pago rechazó el pago/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pagar con Mercado Pago' }))
    await vi.waitFor(() =>
      expect(redirectTo).toHaveBeenCalledWith('/checkout/confirmacion/o-seed-1?status=approved'),
    )
  })

  it('mayorista bajo el pedido mínimo vuelve al carrito', async () => {
    seedServerCart('u-wholesale', 'camiseta-basica', 2)
    renderApp('/checkout', { as: 'wholesale' })
    expect(
      await screen.findByRole('heading', { name: 'Aún no alcanzas el pedido mínimo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al carrito' })).toBeInTheDocument()
  })

  it('sin productos no permite continuar', async () => {
    renderApp('/checkout', { as: 'buyer' })
    expect(
      await screen.findByRole('heading', { name: 'No hay productos para comprar' }),
    ).toBeInTheDocument()
  })
})
