import clsx from 'clsx'
import { FormError } from '@/components/feedback'
import { Button, Checkbox, SelectField, TextField } from '@/components/ui'
import { DEPARTMENTS } from '@/constants/colombia'
import { useForm } from '@/hooks/useForm'
import { validateAddress } from '../../utils/addressValidation'
import './address-form.scss'

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((name) => ({ value: name, label: name }))

const EMPTY = {
  label: '',
  recipient: '',
  phone: '',
  department: '',
  city: '',
  line1: '',
  line2: '',
  notes: '',
  isDefault: false,
}

/**
 * Formulario de dirección. `onSubmit(values)` devuelve una promesa; si el backend
 * responde con errores por campo (details), se muestran junto a cada campo.
 */
export function AddressForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar dirección',
  className,
}) {
  const { field, checkbox, formError, isSubmitting, handleSubmit } = useForm({
    // El backend usa null en campos opcionales; los inputs necesitan string.
    initialValues: {
      ...EMPTY,
      ...Object.fromEntries(
        Object.entries(initialValues ?? {}).map(([key, value]) => [key, value ?? EMPTY[key]]),
      ),
    },
    validate: validateAddress,
    onSubmit,
  })

  return (
    <form className={clsx('address-form', className)} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Nombre de la dirección"
        placeholder="Casa, Tienda, Bodega…"
        required
        {...field('label')}
      />
      <TextField label="Quién recibe" autoComplete="name" required {...field('recipient')} />
      <TextField
        label="Celular"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        hint="10 dígitos, sin indicativo"
        required
        {...field('phone')}
      />
      <div className="address-form__row">
        <SelectField
          label="Departamento"
          options={DEPARTMENT_OPTIONS}
          placeholder="Elige un departamento"
          required
          {...field('department')}
        />
        <TextField
          label="Ciudad o municipio"
          autoComplete="address-level2"
          required
          {...field('city')}
        />
      </div>
      <TextField
        label="Dirección"
        placeholder="Calle 10 # 20-30"
        autoComplete="address-line1"
        required
        {...field('line1')}
      />
      <TextField
        label="Complemento (opcional)"
        placeholder="Apartamento, local, torre…"
        autoComplete="address-line2"
        {...field('line2')}
      />
      <TextField label="Indicaciones para la entrega (opcional)" multiline {...field('notes')} />
      <Checkbox label="Usar como dirección predeterminada" {...checkbox('isDefault')} />

      <FormError>{formError}</FormError>

      <div className="address-form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
