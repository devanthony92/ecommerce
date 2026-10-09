import { useState } from 'react'

/**
 * Estado de formulario sin librerías.
 * - validate(values) → { campo: mensaje }: validación de UX antes de enviar.
 * - onSubmit(values) puede lanzar un ApiError; sus `details` se muestran por campo.
 * - Si hay errores, el foco va al primer campo inválido.
 */
// namedItem devuelve una lista si varios campos comparten nombre (grupo de checkboxes).
function focusField(form, name) {
  const target = form.elements.namedItem(name)
  const field = target instanceof RadioNodeList ? target[0] : target
  field?.focus()
}

export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest)
  }

  const field = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => setValue(name, event.target.value),
  })

  const checkbox = (name) => ({
    name,
    checked: values[name],
    error: errors[name],
    onChange: (event) => setValue(name, event.target.checked),
  })

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const clientErrors = validate?.(values) ?? {}
    setErrors(clientErrors)
    setFormError(null)

    const [firstInvalid] = Object.keys(clientErrors)
    if (firstInvalid) {
      // Por nombre: el DOM todavía no refleja aria-invalid en este punto.
      focusField(form, firstInvalid)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error.details) {
        setErrors(error.details)
        const [firstServerError] = Object.keys(error.details)
        focusField(form, firstServerError)
      } else {
        setFormError(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    errors,
    formError,
    isSubmitting,
    field,
    checkbox,
    setValue,
    setFormError,
    handleSubmit,
  }
}
