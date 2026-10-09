import { Link, Navigate, useSearchParams } from 'react-router'
import { paths, safeRedirectPath } from '@/constants/paths'
import { AuthLayout } from '../components/auth-layout/AuthLayout'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(next, paths.account)} replace />
  }

  const loginHref = next ? `${paths.login}?next=${encodeURIComponent(next)}` : paths.login

  return (
    <AuthLayout
      title="Crear cuenta"
      description="Tu cuenta empieza como comprador. Si tienes un negocio, después puedes solicitar precios mayoristas."
      footer={
        <>
          ¿Ya tienes cuenta? <Link to={loginHref}>Ingresar</Link>
        </>
      }
    >
      <RegisterForm onSubmit={register} />
    </AuthLayout>
  )
}
