import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

const section = (name) => screen.getByRole('region', { name })

describe('Home', () => {
  it('abre con el carrusel de categorías y arma todas las secciones', async () => {
    renderApp('/')

    // Sin hero: el h1 queda solo para lectores de pantalla.
    expect(
      await screen.findByRole('heading', { name: 'Ropa para ti y para tu negocio', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Desde una sola prenda' })).not.toBeInTheDocument()

    // Envío y volumen ya están en la banda de garantías: solo queda la oferta de temporada.
    const promotions = await screen.findByRole('list', { name: 'Promociones' })
    expect(within(promotions).getByRole('link')).toHaveAttribute('href', '/ofertas')

    const carousel = await screen.findByRole('group', { name: 'Categorías' })
    expect(carousel).toHaveAttribute('aria-roledescription', 'carrusel')
    const categories = await within(carousel).findAllByRole('link', { name: /productos$/ })
    expect(categories).toHaveLength(7)
    expect(categories[0]).toHaveAttribute('href', '/catalogo/camisetas')
    expect(within(carousel).getByRole('group', { name: '1 de 7' })).toHaveAttribute(
      'aria-roledescription',
      'diapositiva',
    )
    expect(within(carousel).getByRole('button', { name: 'Categoría anterior' })).toBeInTheDocument()
    expect(
      within(carousel).getByRole('button', { name: 'Categoría siguiente' }),
    ).toBeInTheDocument()
    expect(await within(section('Destacados')).findAllByRole('article')).toHaveLength(4)
    // Las escalas por cantidad son solo para mayoristas.
    expect(screen.queryByRole('region', { name: 'Compra más, paga menos' })).not.toBeInTheDocument()
    expect(section('Beneficios')).toBeInTheDocument()

    // Visitante: la invitación lleva a crear cuenta y volver a la solicitud.
    const cta = section('¿Revendes nuestros productos?')
    expect(within(cta).getByRole('link', { name: 'Crear cuenta y solicitar' })).toHaveAttribute(
      'href',
      '/registro?next=%2Fcuenta%2Fsolicitud-mayorista',
    )
  })

  it('el carrusel se puede pausar y reanudar, con la pausa entre las flechas', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const carousel = await screen.findByRole('group', { name: 'Categorías' })
    // Orden del DOM (y de tabulación) igual al visual: anterior → pausa → siguiente.
    await within(carousel).findByRole('button', { name: 'Pausar carrusel' })
    expect(
      within(carousel)
        .getAllByRole('button')
        .map((button) => button.textContent || button.getAttribute('aria-label')),
    ).toEqual(['Categoría anterior', 'Pausar carrusel', 'Categoría siguiente'])
    await user.click(within(carousel).getByRole('button', { name: 'Pausar carrusel' }))
    await user.click(within(carousel).getByRole('button', { name: 'Reanudar carrusel' }))
    expect(within(carousel).getByRole('button', { name: 'Pausar carrusel' })).toBeInTheDocument()
  })

  describe('carrusel: arrastre con mouse y apertura de categorías', () => {
    const firstCategory = async () => {
      renderApp('/')
      const carousel = await screen.findByRole('group', { name: 'Categorías' })
      const [link] = await within(carousel).findAllByRole('link', { name: /productos$/ })
      return { carousel, link }
    }
    const mouse = { pointerType: 'mouse', pointerId: 1, button: 0 }
    const categoryTitle = () =>
      screen.findByRole('heading', { name: 'Camisetas', level: 1 }, { timeout: 3000 })

    afterEach(() => {
      delete document.startViewTransition
    })

    it('arrastrar con el mouse no abre la categoría y activa el modo arrastre', async () => {
      const { carousel, link } = await firstCategory()
      const track = carousel.querySelector('.category-carousel__track')

      fireEvent.pointerDown(link, { ...mouse, clientX: 200 })
      fireEvent.pointerMove(link, { ...mouse, clientX: 120 })
      expect(track).toHaveClass('category-carousel__track--dragging')
      fireEvent.pointerUp(link, { ...mouse, clientX: 120 })
      fireEvent.click(link)

      expect(screen.queryByRole('heading', { name: 'Camisetas', level: 1 })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Categorías' })).toBeInTheDocument()
    })

    it('un movimiento menor al umbral sigue siendo un clic', async () => {
      const { link } = await firstCategory()
      fireEvent.pointerDown(link, { ...mouse, clientX: 200 })
      fireEvent.pointerMove(link, { ...mouse, clientX: 197 })
      fireEvent.pointerUp(link, { ...mouse, clientX: 197 })
      fireEvent.click(link)
      expect(await categoryTitle()).toBeInTheDocument()
    })

    it('el táctil no entra en modo arrastre (usa el scroll nativo)', async () => {
      const { carousel, link } = await firstCategory()
      fireEvent.pointerDown(link, { ...mouse, pointerType: 'touch', clientX: 200 })
      fireEvent.pointerMove(link, { ...mouse, pointerType: 'touch', clientX: 100 })
      expect(carousel.querySelector('.category-carousel__track')).not.toHaveClass(
        'category-carousel__track--dragging',
      )
    })

    it('con View Transitions navega dentro de la transición', async () => {
      const user = userEvent.setup()
      document.startViewTransition = vi.fn((update) => {
        update()
        return { finished: Promise.resolve() }
      })
      const { link } = await firstCategory()
      await user.click(link)

      expect(document.startViewTransition).toHaveBeenCalledTimes(1)
      expect(await categoryTitle()).toBeInTheDocument()
    })
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
