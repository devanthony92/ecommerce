import { Link, useNavigate, useSearchParams } from 'react-router'
import { useToast } from '@/components/feedback'
import { paths } from '@/constants/paths'
import { authApi } from '../api/authApi'
import { AuthLayout } from '../components/auth-layout/AuthLayout'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const toast = useToast()

  if (!token) {
    return (
      <AuthLayout
        title="Enlace inválido"
        description="Este enlace no es válido. Solicita uno nuevo."
        footer={<Link to={paths.forgotPassword}>Recuperar contraseña</Link>}
      />
    )
  }

  async function handleReset(password) {
    const { message } = await authApi.resetPassword({ token, password })
    toast.show({ tone: 'success', title: 'Contraseña actualizada', description: message })
    navigate(paths.login, { replace: true })
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      footer={<Link to={paths.forgotPassword}>Solicitar otro enlace</Link>}
    >
      <ResetPasswordForm onSubmit={handleReset} />
    </AuthLayout>
  )
}
