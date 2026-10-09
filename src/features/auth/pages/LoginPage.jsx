import { Link, Navigate, useSearchParams } from 'react-router'
import { paths, safeRedirectPath } from '@/constants/paths'
import { ROLES } from '@/constants/statuses'
import { AuthLayout } from '../components/auth-layout/AuthLayout'
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

  const registerHref = next ? `${paths.register}?next=${encodeURIComponent(next)}` : paths.register

  return (
    <AuthLayout
      title="Ingresar"
      description="Compra al detal o por mayor con tu cuenta."
      notice={next && 'Ingresa a tu cuenta para continuar.'}
      footer={
        <>
          ¿No tienes cuenta? <Link to={registerHref}>Crear cuenta</Link>
        </>
      }
    >
      <LoginForm onSubmit={login} />
    </AuthLayout>
  )
}
