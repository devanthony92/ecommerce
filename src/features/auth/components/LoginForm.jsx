import { Link } from 'react-router'
import { PasswordField, TextField } from '@/components/ui'
import { paths } from '@/constants/paths'
import { useForm } from '@/hooks/useForm'
import { validateLogin } from '../utils/authValidation'
import { AuthForm } from './auth-form/AuthForm'
import './login-form.scss'

// `onNavigate`: cierra el modal al ir a recuperar contraseña. `emailRef`: foco inicial del modal.
export function LoginForm({ onSubmit, onNavigate, emailRef }) {
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit,
  })

  return (
    <AuthForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Ingresar"
      className="login-form"
    >
      <TextField
        ref={emailRef}
        label="Correo"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        {...field('email')}
      />
      <div className="login-form__password">
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          required
          {...field('password')}
        />
        <Link className="login-form__forgot" to={paths.forgotPassword} onClick={onNavigate}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthForm>
  )
}
