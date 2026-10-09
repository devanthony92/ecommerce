import { useToast } from '@/components/feedback'
import { StackedForm, TextField } from '@/components/ui'
import { useForm } from '@/hooks/useForm'
import { useUpdateProfile } from '../hooks/useProfile'
import { validateProfile } from '../utils/profileValidation'

export function ProfileForm({ user }) {
  const toast = useToast()
  const updateProfile = useUpdateProfile()
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { name: user.name, phone: user.phone ?? '' },
    validate: validateProfile,
    onSubmit: async (values) => {
      await updateProfile.mutateAsync(values)
      toast.show({ tone: 'success', title: 'Datos actualizados' })
    },
  })

  return (
    <StackedForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Guardar cambios"
    >
      <TextField label="Nombre" autoComplete="name" required {...field('name')} />
      <TextField
        label="Celular (opcional)"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        hint="Para avisarte sobre tus pedidos"
        {...field('phone')}
      />
      <TextField
        label="Correo"
        type="email"
        value={user.email}
        hint="Para cambiar el correo, escríbenos."
        readOnly
        disabled
      />
    </StackedForm>
  )
}
