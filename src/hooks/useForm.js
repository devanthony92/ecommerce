import { useState } from 'react'

/**
 * Estado de formulario sin librerías.
 * - validate(values) → { campo: mensaje }: validación de UX antes de enviar.
 * - onSubmit(values) puede lanzar un ApiError; sus `details` se muestran por campo.
 * - Si hay errores, el foco va al primer campo inválido.
 * - validateOnChange: valida en cada tecla y muestra el error de cada campo en
 *   cuanto el usuario lo modifica. `isValid` permite desactivar el envío.
 */
// namedItem devuelve una lista si varios campos comparten nombre (grupo de checkboxes).
function focusField(form, name) {
  const target = form.elements.namedItem(name)
  const field = target instanceof RadioNodeList ? target[0] : target
  field?.focus()
}

export function useForm({ initialValues, validate, onSubmit, validateOnChange = false }) {
  const [values, setValues] = useState(initialValues)
  // Errores del último envío (validación o backend).
  const [errors, setErrors] = useState({})
  // Campos que el usuario ya modificó (validación en vivo).
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const liveErrors = validate?.(values) ?? {}
  const isValid = Object.keys(liveErrors).length === 0

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    if (validateOnChange)
      setTouched((current) => (current[name] ? current : { ...current, [name]: true }))
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest)
  }

  const errorFor = (name) =>
    errors[name] ?? (validateOnChange && touched[name] ? liveErrors[name] : undefined)

  const field = (name) => ({
    name,
    value: values[name],
    error: errorFor(name),
    onChange: (event) => setValue(name, event.target.value),
  })

  const checkbox = (name) => ({
    name,
    checked: values[name],
    error: errorFor(name),
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
    isValid,
    formError,
    isSubmitting,
    field,
    checkbox,
    setValue,
    setFormError,
    handleSubmit,
  }
}
