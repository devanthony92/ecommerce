import { TextField } from '@/components/ui'
import { useForm } from '@/hooks/useForm'
import { emailError } from '../utils/authValidation'
import { AuthForm } from './auth-form/AuthForm'

export function ForgotPasswordForm({ onSubmit }) {
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { email: '' },
    validate: ({ email }) => (emailError(email) ? { email: emailError(email) } : {}),
    onSubmit: ({ email }) => onSubmit(email.trim()),
  })

  return (
    <AuthForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Enviar enlace"
    >
      <TextField
        label="Correo de tu cuenta"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        {...field('email')}
      />
    </AuthForm>
  )
}
