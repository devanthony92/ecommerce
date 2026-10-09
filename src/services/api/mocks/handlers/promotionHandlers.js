import { ok } from '../router'

// Promociones vigentes. En el backend real se administran desde el panel.
const PROMOTIONS = [
  {
    id: 'promo-season',
    type: 'SEASON',
    title: 'Temporada: hasta 20% menos',
    description: 'Camisetas, camisas, jeans y chaquetas seleccionadas.',
    link: '/ofertas',
    startsAt: '2026-10-01T00:00:00Z',
    endsAt: '2026-10-31T23:59:59Z',
  },
  {
    id: 'promo-volume',
    type: 'VOLUME',
    title: 'Compra más, paga menos',
    description: 'Desde media docena por producto, sumando tallas y colores.',
    link: '/catalogo',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'promo-shipping',
    type: 'SHIPPING',
    title: 'Envío gratis desde $200.000',
    description: 'En envío estándar a todo el país.',
    link: '/carrito',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-12-31T23:59:59Z',
  },
]

export const promotionHandlers = {
  // El backend real filtra por vigencia (startsAt/endsAt). El mock devuelve todas
  // para que la demo no dependa de la fecha del sistema.
  'GET /promotions/active': () => ok(PROMOTIONS),
}
