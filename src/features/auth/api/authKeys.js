// Raíz 'auth': se conserva al cambiar de sesión; el resto de queries se descarta.
export const authKeys = {
  all: ['auth'],
  me: () => [...authKeys.all, 'me'],
}
