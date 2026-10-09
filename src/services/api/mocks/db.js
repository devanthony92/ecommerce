// "Base de datos" del backend simulado. Persiste en localStorage para
// sobrevivir recargas. Borrar la clave `trama.mock-db` reinicia los datos.
import { storage } from '@/services/storage/storage'

const DB_KEY = 'mock-db'
const DB_VERSION = 2

// Usuarios semilla para probar cada perfil (solo existen en el mock).
const seed = () => ({
  version: DB_VERSION,
  users: [
    {
      id: 'u-buyer',
      name: 'Laura Gómez',
      email: 'comprador@trama.test',
      password: 'Trama1234',
      phone: '3001112233',
      role: 'BUYER',
      wholesale: { requestStatus: null, levelCode: null },
    },
    {
      id: 'u-wholesale',
      name: 'Carlos Pérez',
      email: 'mayorista@trama.test',
      password: 'Trama1234',
      phone: '3004445566',
      role: 'WHOLESALE',
      wholesale: { requestStatus: 'APPROVED', levelCode: 'GOLD' },
    },
  ],
  // Carritos de usuarios autenticados: { [userId]: [{ id, variantId, quantity }] }
  carts: {},
})

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
  const canRequest = !['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(user.wholesale.requestStatus)
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
