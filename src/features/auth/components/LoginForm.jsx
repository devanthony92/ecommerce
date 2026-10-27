import { Link } from 'react-router'
import { PasswordField, TextField, StackedForm } from '@/components/ui'
import { paths } from '@/constants/paths'
import { useForm } from '@/hooks/useForm'
import { validateLogin } from '../utils/authValidation'
import './login-form.scss'

/**
 * Validación en cada tecla: los errores aparecen bajo cada campo y el botón
 * queda inactivo hasta que el formulario es válido. El error del servidor
 * (p. ej. credenciales incorrectas) se muestra encima del botón.
 * `onNavigate`: cierra el modal al ir a recuperar contraseña. `emailRef`: foco inicial.
 */
export function LoginForm({ onSubmit, onNavigate, emailRef }) {
  const { field, formError, isSubmitting, isValid, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    validateOnChange: true,
    onSubmit,
  })

  return (
    <StackedForm
      blockSubmit
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitDisabled={!isValid}
      submitLabel="Iniciar sesión"
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
    </StackedForm>
  )
}
