import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useToast } from '@/components/feedback'
import { AuthModal, AuthModalContext, useAuth } from '@/features/auth'
import { safeRedirectPath } from '@/constants/paths'

/**
 * Modales de acceso globales. openLogin/openRegister aceptan:
 * - action: se ejecuta al iniciar sesión (p. ej. agregar a favoritos).
 * - next: ruta a la que se va al iniciar sesión (rutas protegidas).
 */
export function AuthModalProvider({ children }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [state, setState] = useState({ view: null, action: null, next: null })

  const open = useCallback(
    (view) =>
      ({ action = null, next = null } = {}) =>
        setState({ view, action, next }),
    [],
  )
  const value = useMemo(
    () => ({ openLogin: open('login'), openRegister: open('register') }),
    [open],
  )

  const close = () => setState({ view: null, action: null, next: null })
  const switchTo = (view) => setState((current) => ({ ...current, view }))

  async function handleLogin(credentials) {
    const user = await login(credentials)
    const { action, next } = state
    close()
    toast.show({ tone: 'success', title: `Hola, ${user.name.split(' ')[0]}` })
    if (next) navigate(safeRedirectPath(next), { replace: true })
    action?.()
  }

  async function handleRegister(data) {
    await register(data)
    switchTo('registered')
  }

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        view={state.view}
        notice={state.next ? 'Inicia sesión para continuar.' : null}
        onClose={close}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitch={switchTo}
      />
    </AuthModalContext.Provider>
  )
}
