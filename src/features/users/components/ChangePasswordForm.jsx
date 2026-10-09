import { useState } from 'react'
import { useToast } from '@/components/feedback'
import { PasswordField, StackedForm } from '@/components/ui'
import { PASSWORD_HINT } from '@/features/auth'
import { useForm } from '@/hooks/useForm'
import { useChangePassword } from '../hooks/useProfile'
import { validatePasswordChange } from '../utils/profileValidation'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordForm() {
  const toast = useToast()
  const changePassword = useChangePassword()
  // Al guardar se remonta el formulario para dejar los campos vacíos.
  const [formKey, setFormKey] = useState(0)

  return (
    <PasswordFields
      key={formKey}
      onSubmit={async ({ currentPassword, newPassword }) => {
        await changePassword.mutateAsync({ currentPassword, newPassword })
        toast.show({ tone: 'success', title: 'Contraseña actualizada' })
        setFormKey((key) => key + 1)
      }}
    />
  )
}

function PasswordFields({ onSubmit }) {
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: EMPTY,
    validate: validatePasswordChange,
    onSubmit,
  })

  return (
    <StackedForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Cambiar contraseña"
    >
      <PasswordField
        label="Contraseña actual"
        autoComplete="current-password"
        required
        {...field('currentPassword')}
      />
      <PasswordField
        label="Nueva contraseña"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        required
        {...field('newPassword')}
      />
      <PasswordField
        label="Confirmar nueva contraseña"
        autoComplete="new-password"
        required
        {...field('confirmPassword')}
      />
    </StackedForm>
  )
}
