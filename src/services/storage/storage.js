// localStorage puede no existir o lanzar (modo privado, cuota llena).
// Todas las lecturas y escrituras pasan por aquí.

const PREFIX = 'trama.'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Sin persistencia: la app sigue funcionando en memoria.
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // Ignorado a propósito.
    }
  },
}

export const STORAGE_KEYS = {
  token: 'token',
  guestCart: 'guest-cart',
  inspiration: 'inspiration',
}
