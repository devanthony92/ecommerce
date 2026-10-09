import { PasswordField, StackedForm } from '@/components/ui'
import { useForm } from '@/hooks/useForm'
import { PASSWORD_HINT, validateReset } from '../utils/authValidation'

export function ResetPasswordForm({ onSubmit }) {
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: validateReset,
    onSubmit: ({ password }) => onSubmit(password),
  })

  return (
    <StackedForm
      blockSubmit
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Guardar contraseña"
    >
      <PasswordField
        label="Nueva contraseña"
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
    </StackedForm>
  )
}
