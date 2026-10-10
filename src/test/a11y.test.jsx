import axe from 'axe-core'
import { screen } from '@testing-library/react'
import { getDb, resetDb, save } from '@/services/api/mocks/db'
import { renderApp } from '@/test/renderApp'

/**
 * Auditoría automática de accesibilidad (WCAG 2.1 A/AA) con axe-core.
 * jsdom no calcula estilos reales: el contraste se audita en el navegador.
 */
async function audit() {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: {
      'color-contrast': { enabled: false },
      // En los tests se renderiza la app sin el <html lang> del index.html.
      'html-has-lang': { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  })
  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.help}\n  → ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join('\n  → ')}`,
  )
}

const PAGES = [
  { name: 'home', route: '/', ready: 'Ropa para ti y para tu negocio' },
  { name: 'catálogo', route: '/catalogo', ready: 'Catálogo' },
  { name: 'producto', route: '/producto/camiseta-basica', ready: 'Camiseta básica' },
  { name: 'ofertas', route: '/ofertas', ready: 'Ofertas' },
  { name: 'mayoristas', route: '/mayoristas', ready: 'Compra por mayor y gana más en tu negocio' },
  { name: 'login', route: '/ingresar', ready: 'Ingresar' },
  { name: 'registro', route: '/registro', ready: 'Crear cuenta' },
  { name: 'carrito', route: '/carrito', ready: 'Carrito', as: 'wholesale', seedCart: true },
  {
    name: 'checkout',
    route: '/checkout',
    ready: 'Finalizar compra',
    as: 'wholesale',
    seedCart: true,
  },
  { name: 'cuenta', route: '/cuenta', ready: 'Hola, Laura Gómez', as: 'buyer' },
  { name: 'perfil', route: '/cuenta/perfil', ready: 'Perfil', as: 'buyer' },
  { name: 'direcciones', route: '/cuenta/direcciones', ready: 'Direcciones', as: 'wholesale' },
  { name: 'pedidos', route: '/cuenta/pedidos', ready: 'Pedidos', as: 'wholesale' },
  {
    name: 'detalle pedido',
    route: '/cuenta/pedidos/o-seed-3',
    ready: 'Pedido PED-000118',
    as: 'wholesale',
  },
  { name: 'favoritos', route: '/cuenta/favoritos', ready: 'Favoritos', as: 'wholesale' },
  { name: 'lista', route: '/cuenta/listas/l-seed-1', ready: 'Pedido mensual', as: 'wholesale' },
  {
    name: 'solicitud mayorista',
    route: '/cuenta/solicitud-mayorista',
    ready: 'Cuenta mayorista',
    as: 'buyer',
  },
  { name: 'panel mayorista', route: '/mayorista', ready: 'Hola, Carlos', as: 'wholesale' },
  {
    name: 'pedido rápido',
    route: '/mayorista/pedido-rapido',
    ready: 'Pedido rápido',
    as: 'wholesale',
  },
  {
    name: 'frecuentes',
    route: '/mayorista/frecuentes',
    ready: 'Mis productos habituales',
    as: 'wholesale',
  },
]

beforeEach(() => resetDb())

describe('Accesibilidad (axe)', () => {
  it.each(PAGES)('$name no tiene violaciones', async ({ route, ready, as, seedCart }) => {
    if (seedCart) {
      getDb().carts['u-wholesale'] = [
        { id: 'ci-a11y', variantId: 'camiseta-basica-negro-m', quantity: 6 },
      ]
      save()
    }
    renderApp(route, { as })
    await screen.findByRole('heading', { name: ready, level: undefined }, { timeout: 5000 })
    // Espera a que terminen las cargas secundarias (skeletons → contenido).
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(await audit()).toEqual([])
  })
})
