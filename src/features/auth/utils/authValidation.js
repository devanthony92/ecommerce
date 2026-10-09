// Validación de UX (mensajes inmediatos). El backend vuelve a validar todo.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con letras y números.'

export function passwordError(password = '') {
  if (password.length < 8) return 'Mínimo 8 caracteres.'
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Usa letras y números.'
  return null
}

export function emailError(email = '') {
  if (!email.trim()) return 'Ingresa tu correo.'
  if (!EMAIL_RE.test(email.trim())) return 'Ingresa un correo válido.'
  return null
}

const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, value]) => value))

export function validateLogin({ email, password }) {
  return clean({
    email: emailError(email),
    password: password ? null : 'Ingresa tu contraseña.',
  })
}

export function validateRegister({ name, email, password, confirmPassword, acceptTerms }) {
  return clean({
    name: (name ?? '').trim().length >= 2 ? null : 'Ingresa tu nombre.',
    email: emailError(email),
    password: passwordError(password),
    confirmPassword: confirmPassword === password ? null : 'Las contraseñas no coinciden.',
    acceptTerms: acceptTerms ? null : 'Debes aceptar los términos para crear la cuenta.',
  })
}

export function validateReset({ password, confirmPassword }) {
  return clean({
    password: passwordError(password),
    confirmPassword: confirmPassword === password ? null : 'Las contraseñas no coinciden.',
  })
}
