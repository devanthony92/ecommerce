import { Checkbox, PasswordField, TextField, StackedForm } from '@/components/ui'
import { useForm } from '@/hooks/useForm'
import { PASSWORD_HINT, validateRegister } from '../utils/authValidation'

// Misma validación en vivo que el ingreso: botón inactivo hasta que todo es válido.
export function RegisterForm({ onSubmit, nameRef }) {
  const { field, checkbox, formError, isSubmitting, isValid, handleSubmit } = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
    validate: validateRegister,
    validateOnChange: true,
    // confirmPassword es solo de UX: no se envía.
    onSubmit: ({ confirmPassword: _confirm, ...data }) => onSubmit(data),
  })

  return (
    <StackedForm
      blockSubmit
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitDisabled={!isValid}
      submitLabel="Registrarse"
    >
      <TextField ref={nameRef} label="Nombre" autoComplete="name" required {...field('name')} />
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
    </StackedForm>
  )
}
