import { Link, Navigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout'
import { paths, safeRedirectPath } from '@/app/routes/paths'
import { ROLES } from '@/constants/statuses'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

function homeFor(user) {
  return user.role === ROLES.WHOLESALE ? paths.wholesale : paths.account
}

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  // Tras un login exitoso el contexto cambia y este mismo render redirige.
  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(next, homeFor(user))} replace />
  }

  return (
    <>
      <PageHeader title="Ingresar" />
      <LoginForm onSubmit={login} />
      <p>
        ¿No tienes cuenta? <Link to={paths.register}>Crear cuenta</Link>
      </p>
    </>
  )
}
