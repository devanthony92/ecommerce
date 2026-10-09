import { useId, useState } from 'react'
import './login-form.scss'

// Versión funcional mínima. Estilo y validación final en la fase 8 (con TextField/Button).
export function LoginForm({ onSubmit }) {
  const id = useId()
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
      <div className="login-form__field">
        <label className="login-form__label" htmlFor={`${id}-email`}>
          Correo
        </label>
        <input
          className="login-form__input"
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={`${id}-password`}>
          Contraseña
        </label>
        <input
          className="login-form__input"
          id={`${id}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      )}

      <button className="login-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
