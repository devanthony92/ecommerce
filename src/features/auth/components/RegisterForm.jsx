import { Checkbox, PasswordField, TextField } from '@/components/ui'
import { useForm } from '@/hooks/useForm'
import { PASSWORD_HINT, validateRegister } from '../utils/authValidation'
import { AuthForm } from './auth-form/AuthForm'

export function RegisterForm({ onSubmit }) {
  const { field, checkbox, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
    validate: validateRegister,
    // confirmPassword es solo de UX: no se envía.
    onSubmit: ({ confirmPassword: _confirm, ...data }) => onSubmit(data),
  })

  return (
    <AuthForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Crear cuenta"
    >
      <TextField label="Nombre" autoComplete="name" required {...field('name')} />
      <TextField
        label="Correo"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        {...field('email')}
      />
      <PasswordField
        label="Contraseña"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        required
        {...field('password')}
      />
      <PasswordField
        label="Confirmar contraseña"
        autoComplete="new-password"
        required
        {...field('confirmPassword')}
      />
      <Checkbox label="Acepto los términos y la política de datos" {...checkbox('acceptTerms')} />
    </AuthForm>
  )
}
