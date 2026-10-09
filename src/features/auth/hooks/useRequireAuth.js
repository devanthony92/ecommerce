import { useCallback, useContext } from 'react'
import { LoginPromptContext } from '../LoginPromptContext'
import { useAuth } from './useAuth'

/**
 * Ejecuta una acción que requiere cuenta. Sin sesión abre el modal de login
 * y, al ingresar, ejecuta la acción pendiente (p. ej. agregar a favoritos).
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const requestLogin = useContext(LoginPromptContext)
  if (!requestLogin) {
    throw new Error('useRequireAuth debe usarse dentro de <LoginPromptProvider>.')
  }

  return useCallback(
    (action) => (isAuthenticated ? action?.() : requestLogin(action)),
    [isAuthenticated, requestLogin],
  )
}
