import { useRef } from 'react'
import { Modal } from '@/components/modal'
import { Button, Icon } from '@/components/ui'
import { LoginForm } from '../LoginForm'
import { RegisterForm } from '../RegisterForm'
import './auth-modal.scss'

const TITLES = {
  login: 'Iniciar sesión',
  register: 'Registrarse',
  registered: 'Registro completado',
}

/**
 * Modal de acceso con tres vistas:
 * - login: formulario de inicio de sesión.
 * - register: formulario de registro.
 * - registered: aviso de registro exitoso con acceso al inicio de sesión.
 * `notice`: aviso sobre el formulario (p. ej. al llegar desde una ruta protegida).
 */
export function AuthModal({ view, notice, onClose, onLogin, onRegister, onSwitch }) {
  const firstFieldRef = useRef(null)
  const loginButtonRef = useRef(null)

  return (
    <Modal
      open={view !== null}
      onClose={onClose}
      title={TITLES[view] ?? TITLES.login}
      size="sm"
      initialFocusRef={view === 'registered' ? loginButtonRef : firstFieldRef}
    >
      <div className="auth-modal">
        {view === 'login' && (
          <>
            {notice && <p className="auth-modal__notice">{notice}</p>}
            <LoginForm onSubmit={onLogin} onNavigate={onClose} emailRef={firstFieldRef} />
            <p className="auth-modal__switch">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="auth-modal__link"
                onClick={() => onSwitch('register')}
              >
                Registrarse
              </button>
            </p>
          </>
        )}

        {view === 'register' && (
          <>
            {notice && <p className="auth-modal__notice">{notice}</p>}
            <p className="auth-modal__intro">
              Tu cuenta empieza como comprador. Si tienes un negocio, después puedes solicitar
              precios mayoristas.
            </p>
            <RegisterForm onSubmit={onRegister} nameRef={firstFieldRef} />
            <p className="auth-modal__switch">
              ¿Ya tienes cuenta?{' '}
              <button type="button" className="auth-modal__link" onClick={() => onSwitch('login')}>
                Iniciar sesión
              </button>
            </p>
          </>
        )}

        {view === 'registered' && (
          <div className="auth-modal__success" role="status">
            <span className="auth-modal__success-icon">
              <Icon name="check" size="xl" />
            </span>
            <p>¡Listo! Tu cuenta quedó creada. Ya puedes iniciar sesión.</p>
            <Button ref={loginButtonRef} block onClick={() => onSwitch('login')}>
              Iniciar sesión
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
