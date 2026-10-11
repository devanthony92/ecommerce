import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth, useAuthModal } from '@/features/auth'
import { SESSION_STATUS } from '@/constants/statuses'
import { LoadingState } from '@/components/feedback'
import { paths } from '@/constants/paths'

/**
 * Protege las rutas anidadas. Sin sesión, quien entra por un enlace directo
 * vuelve al inicio con el modal de inicio de sesión abierto; al ingresar, sigue
 * a la página que pidió.
 */
export function ProtectedRoute() {
  const { status, signedOutFrom } = useAuth()
  const { openLogin } = useAuthModal()
  const location = useLocation()
  const next = location.pathname + location.search
  // Cerró sesión a propósito desde aquí: va al inicio sin pedirle que ingrese.
  const signedOutHere = signedOutFrom === location.pathname
  const mustLogin = status === SESSION_STATUS.ANONYMOUS && !signedOutHere

  useEffect(() => {
    if (mustLogin) openLogin({ next })
  }, [mustLogin, next, openLogin])

  // Mientras se valida el token no se redirige: evita expulsar a alguien con sesión válida.
  if (status === SESSION_STATUS.UNKNOWN) return <LoadingState page label="Verificando sesión…" />
  if (status === SESSION_STATUS.ANONYMOUS) return <Navigate to={paths.home} replace />
  return <Outlet />
}
