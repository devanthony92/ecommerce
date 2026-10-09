import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth'
import { SESSION_STATUS } from '@/constants/statuses'
import { LoadingState } from '@/components/feedback'
import { paths } from '@/constants/paths'

export function RequireAuth() {
  const { status, signedOutFrom } = useAuth()
  const location = useLocation()

  // Mientras se valida el token no se redirige: evita expulsar a alguien con sesión válida.
  if (status === SESSION_STATUS.UNKNOWN) return <LoadingState page label="Verificando sesión…" />

  // Cerró sesión a propósito: no tiene sentido pedirle que vuelva a ingresar.
  if (status === SESSION_STATUS.ANONYMOUS && signedOutFrom === location.pathname) {
    return <Navigate to={paths.home} replace />
  }

  if (status === SESSION_STATUS.ANONYMOUS) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${paths.login}?next=${next}`} replace />
  }

  return <Outlet />
}
