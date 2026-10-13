import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAuthModal } from './useAuthModal'

/**
 * Ejecuta una acción que requiere cuenta. Sin sesión abre el modal de acceso y,
 * al ingresar, ejecuta la acción pendiente (p. ej. agregar a favoritos).
 * Opciones: `mode` ('login' | 'register') elige la vista inicial; `notice`
 * explica por qué se pide la cuenta.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const { openLogin, openRegister } = useAuthModal()

  return useCallback(
    (action, { mode = 'login', notice = null } = {}) => {
      if (isAuthenticated) return action?.()
      const open = mode === 'register' ? openRegister : openLogin
      return open({ action, notice })
    },
    [isAuthenticated, openLogin, openRegister],
  )
}
