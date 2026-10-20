import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { paths, safeRedirectPath } from '@/constants/paths'
import { ROLES } from '@/constants/statuses'
import { useAuth } from '../hooks/useAuth'
import { useAuthModal } from '../hooks/useAuthModal'

function homeFor(user) {
  return user.role === ROLES.WHOLESALE ? paths.wholesale : paths.account
}

/**
 * /ingresar y /registro (enlaces directos, correos, invitaciones): abren el
 * modal correspondiente sobre el inicio. `?next=` indica a dónde ir al ingresar.
 */
export default function AuthEntryPage({ mode }) {
  const { currentUser, isAuthenticated } = useAuth()
  const { openLogin, openRegister } = useAuthModal()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  useEffect(() => {
    if (isAuthenticated) return
    const open = mode === 'register' ? openRegister : openLogin
    open({ next })
  }, [isAuthenticated, mode, next, openLogin, openRegister])

  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(next, homeFor(currentUser))} replace />
  }
  return <Navigate to={paths.home} replace />
}
