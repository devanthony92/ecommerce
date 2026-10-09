import { useState } from 'react'
import clsx from 'clsx'
import { Button, Checkbox, SelectField, TextField } from '@/components/ui'
import { DEPARTMENTS } from '@/constants/colombia'
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
  const [values, setValues] = useState({ ...EMPTY, ...initialValues })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const field = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => {
      setValues((current) => ({ ...current, [name]: event.target.value }))
      if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest)
    },
  })

  async function handleSubmit(event) {
    event.preventDefault()
    const clientErrors = validateAddress(values)
    setErrors(clientErrors)
    setFormError(null)
    const [firstInvalid] = Object.keys(clientErrors)
    if (firstInvalid) {
      // Lleva el foco al primer campo con error (por nombre: el DOM aún no se actualizó).
      event.currentTarget.elements.namedItem(firstInvalid)?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error.details) setErrors(error.details)
      setFormError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <Checkbox
        label="Usar como dirección predeterminada"
        checked={values.isDefault}
        onChange={(event) =>
          setValues((current) => ({ ...current, isDefault: event.target.checked }))
        }
      />

      {formError && (
        <p className="address-form__error" role="alert">
          {formError}
        </p>
      )}

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
