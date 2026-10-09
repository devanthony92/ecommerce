import { useState } from 'react'
import { Button, TextField } from '@/components/ui'
import './login-form.scss'

// Versión mínima funcional. Validación por campo y diseño final en la fase 8.
export function LoginForm({ onSubmit }) {
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ email: form.get('email'), password: form.get('password') })
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <TextField label="Correo" name="email" type="email" autoComplete="email" required />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {error && (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        Ingresar
      </Button>
    </form>
  )
}
