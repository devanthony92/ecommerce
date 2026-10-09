import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

const priceRegion = () => document.querySelector('.price-display')

async function openProduct(slug = 'camiseta-basica', options) {
  renderApp(`/producto/${slug}`, options)
  return screen.findByRole('heading', { level: 1, name: /Camiseta básica|Gorra/ })
}

describe('Detalle de producto', () => {
  it('muestra precio público, escalas y pide elegir talla', async () => {
    await openProduct()
    expect(priceRegion()).toHaveTextContent(/35\.000/)
    expect(screen.getByRole('heading', { name: 'Compra más, paga menos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Docena/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Elige una talla' })).toBeDisabled()
  })

  it('al elegir una escala cotiza con el backend y muestra el incentivo siguiente', async () => {
    const user = userEvent.setup()
    await openProduct()

    await user.click(screen.getByRole('button', { name: /^Media docena/ }))
    expect(screen.getByRole('spinbutton', { name: 'Cantidad' })).toHaveValue('6')

    // 35.000 − 11% = 31.150 → redondeado a 31.200 por el backend.
    expect(await screen.findByText('Precio por media docena')).toBeInTheDocument()
    expect(priceRegion()).toHaveTextContent(/31\.200/)
    expect(screen.getByRole('button', { name: /^Media docena/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText(/más y obtén precio de docena/)).toBeInTheDocument()
  })

  it('agrega la variante elegida al carrito', async () => {
    const user = userEvent.setup()
    await openProduct()

    const sizes = screen.getByRole('group', { name: /^Talla/ })
    const firstAvailable = within(sizes)
      .getAllByRole('radio')
      .find((radio) => !radio.disabled)
    await user.click(firstAvailable)

    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(await screen.findByText('Agregado al carrito')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Carrito, 1 producto' })).toBeInTheDocument()
  })

  it('el mayorista ve su precio y por qué', async () => {
    await openProduct('camiseta-basica', { as: 'wholesale' })
    expect(screen.getByText('Tu precio')).toBeInTheDocument()
    expect(screen.getByText('Nivel ORO −12%')).toBeInTheDocument()
    // 35.000 − 12% = 30.800
    expect(priceRegion()).toHaveTextContent(/30\.800/)
  })

  it('producto inexistente muestra aviso', async () => {
    renderApp('/producto/no-existe')
    expect(
      await screen.findByRole('heading', { name: 'Producto no encontrado' }),
    ).toBeInTheDocument()
  })
})
