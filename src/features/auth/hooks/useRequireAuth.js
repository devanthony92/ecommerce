import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAuthModal } from './useAuthModal'

/**
 * Ejecuta una acción que requiere cuenta. Sin sesión abre el modal de inicio
 * de sesión y, al ingresar, ejecuta la acción pendiente (p. ej. agregar a favoritos).
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()

  return useCallback(
    (action) => (isAuthenticated ? action?.() : openLogin({ action })),
    [isAuthenticated, openLogin],
  )
}
