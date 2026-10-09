import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetDb } from '@/services/api/mocks/db'
import { products } from '@/services/api/mocks/fixtures/products'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { renderApp } from '@/test/renderApp'

// Variantes con stock de un producto del catálogo simulado.
function availableVariants(slug, count) {
  const product = products.find((item) => item.slug === slug)
  return product.variants.filter((variant) => variant.stock >= 30).slice(0, count)
}

function seedGuestCart(lines) {
  storage.set(STORAGE_KEYS.guestCart, lines)
}

const summary = () => screen.getByRole('region', { name: 'Resumen del pedido' })
const incentives = () => screen.getByRole('region', { name: 'Beneficios por comprar más' })

beforeEach(() => resetDb())

describe('Carrito', () => {
  it('vacío muestra el acceso al catálogo', async () => {
    renderApp('/carrito')
    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument()
  })

  it('invitado: precios del backend, escala por producto y envío gratis', async () => {
    const [first, second] = availableVariants('camiseta-basica', 2)
    seedGuestCart([
      { variantId: first.id, quantity: 3 },
      { variantId: second.id, quantity: 2 },
    ])
    renderApp('/carrito')

    expect(await screen.findAllByRole('article')).toHaveLength(2)
    // 5 unidades × 35.000 (sin escala todavía), envío 12.000.
    expect(within(summary()).getByText(/175\.000/)).toBeInTheDocument()
    expect(within(summary()).getByText(/187\.000/)).toBeInTheDocument()
    // La escala suma ambas tallas/colores del mismo producto.
    expect(within(incentives()).getByText(/agrega 1 unidad más/)).toBeInTheDocument()
    expect(within(incentives()).getByText(/25\.000/)).toBeInTheDocument()
  })

  it('al llegar a media docena baja el precio de todas las variantes', async () => {
    const user = userEvent.setup()
    const [first, second] = availableVariants('camiseta-basica', 2)
    seedGuestCart([
      { variantId: first.id, quantity: 3 },
      { variantId: second.id, quantity: 2 },
    ])
    renderApp('/carrito')
    await screen.findAllByRole('article')

    const [increase] = screen.getAllByRole('button', {
      name: 'Aumentar cantidad de camiseta básica',
    })
    await user.click(increase)

    // 6 × 31.200 = 187.200; descuento 210.000 − 187.200 = 22.800; faltan 12.800 para envío gratis.
    expect(await within(summary()).findByText(/Estás ahorrando .*22.800/)).toBeInTheDocument()
    expect(within(incentives()).getByText(/12.800/)).toBeInTheDocument()
    // La siguiente escala ya es la docena.
    expect(within(incentives()).getByText(/por docena/)).toBeInTheDocument()
  })

  it('quita un producto', async () => {
    const user = userEvent.setup()
    const [variant] = availableVariants('jean-slim', 1)
    seedGuestCart([{ variantId: variant.id, quantity: 1 }])
    renderApp('/carrito')

    await user.click(await screen.findByRole('button', { name: 'Quitar Jean slim del carrito' }))
    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument()
  })

  it('al iniciar sesión fusiona el carrito de invitado con el del usuario', async () => {
    const user = userEvent.setup()
    const [variant] = availableVariants('gorra-beisbol', 1)
    seedGuestCart([{ variantId: variant.id, quantity: 2 }])
    renderApp('/ingresar?next=/carrito')

    await user.type(await screen.findByLabelText(/^Correo/), 'comprador@trama.test')
    await user.type(screen.getByLabelText(/^Contraseña/), 'Trama1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('link', { name: 'Gorra béisbol' })).toBeInTheDocument()
    expect(storage.get(STORAGE_KEYS.guestCart)).toEqual([])
    expect(screen.getByRole('button', { name: 'Carrito, 2 productos' })).toBeInTheDocument()
  })
})
