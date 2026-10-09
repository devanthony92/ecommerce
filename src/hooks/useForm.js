import { useState } from 'react'

/**
 * Estado de formulario sin librerías.
 * - validate(values) → { campo: mensaje }: validación de UX antes de enviar.
 * - onSubmit(values) puede lanzar un ApiError; sus `details` se muestran por campo.
 * - Si hay errores, el foco va al primer campo inválido.
 */
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
      form.elements.namedItem(firstInvalid)?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error.details) {
        setErrors(error.details)
        const [firstServerError] = Object.keys(error.details)
        form.elements.namedItem(firstServerError)?.focus()
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
