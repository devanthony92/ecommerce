// "Base de datos" del backend simulado. Persiste en localStorage para
// sobrevivir recargas. Borrar la clave `trama.mock-db` reinicia los datos.
import { storage } from '@/services/storage/storage'
import { seedOrders } from './fixtures/orders'

const DB_KEY = 'mock-db'
const DB_VERSION = 8

// Compra acumulada del mayorista semilla en 2026: pedidos de ejemplo + compras previas.
const SEED_ACCUMULATED = 3450000

// Usuarios semilla para probar cada perfil (solo existen en el mock).
const seed = () => {
  const orders = seedOrders()
  const ordersTotal = orders.reduce((sum, order) => sum + order.summary.total, 0)
  return {
    version: DB_VERSION,
    users: [
      {
        id: 'u-buyer',
        name: 'Laura Gómez',
        email: 'comprador@trama.test',
        password: 'Trama1234',
        phone: '3001112233',
        role: 'BUYER',
        wholesale: { requestStatus: null },
      },
      {
        id: 'u-wholesale',
        name: 'Carlos Pérez',
        email: 'mayorista@trama.test',
        password: 'Trama1234',
        phone: '3004445566',
        role: 'WHOLESALE',
        wholesale: {
          requestStatus: 'APPROVED',
          accumulatedBase: SEED_ACCUMULATED - ordersTotal,
          savingsBase: 180000,
        },
      },
    ],
    // Carritos de usuarios autenticados: { [userId]: [{ id, variantId, quantity }] }
    carts: {},
    // Direcciones por usuario. El mayorista ya tiene una; el comprador empieza sin ninguna.
    addresses: {
      'u-wholesale': [
        {
          id: 'a-seed-1',
          label: 'Tienda',
          recipient: 'Carlos Pérez',
          phone: '3004445566',
          department: 'Antioquia',
          city: 'Medellín',
          line1: 'Carrera 52 # 45-20, local 3',
          line2: null,
          notes: 'Horario de recibo: 8 a.m. a 5 p.m.',
          isDefault: true,
        },
      ],
    },
    orders,
    orderSequence: 120,
    // Tokens de recuperación de contraseña: { [token]: { userId, expiresAt } }
    passwordResets: {},
    // Favoritos: { [userId]: productId[] }
    favorites: { 'u-wholesale': ['p-camiseta-basica', 'p-jean-slim', 'p-gorra-beisbol'] },
    // Listas de compra: { [userId]: [{ id, name, updatedAt, items: [{ id, variantId, quantity }] }] }
    lists: {
      'u-wholesale': [
        {
          id: 'l-seed-1',
          name: 'Pedido mensual',
          updatedAt: '2026-10-01T12:00:00Z',
          items: [
            { id: 'li-1', variantId: 'camiseta-basica-negro-m', quantity: 12 },
            { id: 'li-2', variantId: 'camiseta-basica-blanco-l', quantity: 12 },
            { id: 'li-3', variantId: 'jean-slim-denim-30', quantity: 6 },
            { id: 'li-4', variantId: 'gorra-beisbol-negro-única', quantity: 12 },
          ],
        },
      ],
    },
    // Solicitudes mayoristas: { [userId]: WholesaleRequest }
    wholesaleRequests: {
      'u-wholesale': {
        id: 'wr-seed-1',
        status: 'APPROVED',
        submittedAt: '2026-03-02T14:00:00Z',
        reviewedAt: '2026-03-04T10:00:00Z',
        rejectionReason: null,
        data: {
          tradeName: 'Moda Carlos',
          legalName: 'Carlos Pérez',
          nit: '900123456-7',
          phone: '3004445566',
          city: 'Medellín',
          address: 'Carrera 52 # 45-20, local 3',
          businessType: 'PHYSICAL_STORE',
          socialLinks: '@modacarlos',
          estimatedMonthlyVolume: '1M_5M',
          categoriesOfInterest: ['c-camisetas', 'c-jeans'],
        },
      },
    },
  }
}

let db = load()

function load() {
  const saved = storage.get(DB_KEY)
  return saved?.version === DB_VERSION ? saved : seed()
}

export function save() {
  storage.set(DB_KEY, db)
}

export function getDb() {
  return db
}

export function resetDb() {
  db = seed()
  save()
}

// Permisos por rol: en el backend real esto vive en el servidor.
const BASE_PERMISSIONS = [
  'cart.manage',
  'checkout.create',
  'orders.view',
  'favorites.manage',
  'lists.manage',
]

function permissionsFor(user) {
  if (user.role === 'WHOLESALE') {
    return [...BASE_PERMISSIONS, 'wholesale.access', 'wholesale.quick-order']
  }
  if (user.role === 'ADMIN') {
    return [...BASE_PERMISSIONS, 'admin.access']
  }
  // Puede solicitar si nunca lo hizo o si fue rechazado. Suspendido debe contactar a la tienda.
  const canRequest = [null, 'REJECTED'].includes(user.wholesale.requestStatus)
  return canRequest ? [...BASE_PERMISSIONS, 'wholesale.request'] : BASE_PERMISSIONS
}

export function toPublicUser(user) {
  const { password: _password, ...rest } = user
  return { ...rest, permissions: permissionsFor(user) }
}

export const tokenFor = (user) => `mock-token-${user.id}`

export function getUserFromToken(token) {
  if (!token?.startsWith('mock-token-')) return null
  const id = token.slice('mock-token-'.length)
  return db.users.find((user) => user.id === id) ?? null
}
