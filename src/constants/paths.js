// Única fuente de rutas. Nunca escribir paths a mano en componentes.
export const paths = Object.freeze({
  home: '/',
  catalog: '/catalogo',
  category: (slug) => `/catalogo/${slug}`,
  product: (slug) => `/producto/${slug}`,
  promotions: '/ofertas',
  inspiration: '/inspiracion',
  search: '/buscar',
  cart: '/carrito',
  wholesaleLanding: '/mayoristas',
  login: '/ingresar',
  register: '/registro',
  forgotPassword: '/recuperar-contrasena',
  resetPassword: '/restablecer-contrasena',

  checkout: '/checkout',
  orderConfirmation: (orderId) => `/checkout/confirmacion/${orderId}`,

  account: '/cuenta',
  orders: '/cuenta/pedidos',
  order: (orderId) => `/cuenta/pedidos/${orderId}`,
  favorites: '/cuenta/favoritos',
  lists: '/cuenta/listas',
  list: (listId) => `/cuenta/listas/${listId}`,
  addresses: '/cuenta/direcciones',
  profile: '/cuenta/perfil',
  wholesaleRequest: '/cuenta/solicitud-mayorista',

  wholesale: '/mayorista',
  wholesaleCatalog: '/mayorista/catalogo',
  quickOrder: '/mayorista/pedido-rapido',
  frequentProducts: '/mayorista/frecuentes',
  benefits: '/mayorista/beneficios',
})

// Evita open redirect: solo rutas internas (`/x`, no `//dominio`).
export function safeRedirectPath(value, fallback = paths.home) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback
}
