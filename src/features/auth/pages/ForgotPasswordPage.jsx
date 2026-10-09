import { useState } from 'react'
import { Link } from 'react-router'
import { paths } from '@/constants/paths'
import { authApi } from '../api/authApi'
import { AuthLayout } from '../components/auth-layout/AuthLayout'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  const [result, setResult] = useState(null)

  const backToLogin = <Link to={paths.login}>Volver a ingresar</Link>

  if (result) {
    return (
      <AuthLayout title="Revisa tu correo" description={result.message} footer={backToLogin}>
        {/* Solo el backend simulado devuelve el enlace: en la demo no se envían correos. */}
        {result.devResetToken && (
          <p>
            Demo:{' '}
            <Link to={`${paths.resetPassword}?token=${encodeURIComponent(result.devResetToken)}`}>
              abrir el enlace de restablecimiento
            </Link>
          </p>
        )}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para crear una contraseña nueva."
      footer={backToLogin}
    >
      <ForgotPasswordForm
        onSubmit={async (email) => setResult(await authApi.forgotPassword(email))}
      />
    </AuthLayout>
  )
}
