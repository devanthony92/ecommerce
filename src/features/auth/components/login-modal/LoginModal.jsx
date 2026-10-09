import { useRef } from 'react'
import { Link } from 'react-router'
import { Modal } from '@/components/modal'
import { paths } from '@/constants/paths'
import { useAuth } from '../../hooks/useAuth'
import { LoginForm } from '../LoginForm'
import './login-modal.scss'

// Login sin salir de la página actual. `onSuccess` recibe el usuario.
export function LoginModal({ open, onClose, onSuccess }) {
  const { login } = useAuth()
  const emailRef = useRef(null)

  async function handleLogin(credentials) {
    const user = await login(credentials)
    onSuccess(user)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ingresa a tu cuenta"
      size="sm"
      initialFocusRef={emailRef}
    >
      <div className="login-modal">
        <LoginForm onSubmit={handleLogin} onNavigate={onClose} emailRef={emailRef} />
        <p className="login-modal__register">
          ¿No tienes cuenta?{' '}
          <Link to={paths.register} onClick={onClose}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </Modal>
  )
}
