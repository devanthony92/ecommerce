import { passwordError } from '@/features/auth'

const PHONE_RE = /^3\d{9}$/

export function validateProfile({ name, phone }) {
  const errors = {}
  if ((name ?? '').trim().length < 2) errors.name = 'Ingresa tu nombre.'
  if (phone?.trim() && !PHONE_RE.test(phone.trim())) {
    errors.phone = 'Celular de 10 dígitos que empiece por 3.'
  }
  return errors
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {}
  if (!currentPassword) errors.currentPassword = 'Ingresa tu contraseña actual.'
  const invalid = passwordError(newPassword)
  if (invalid) errors.newPassword = invalid
  else if (newPassword === currentPassword) {
    errors.newPassword = 'La nueva contraseña debe ser distinta a la actual.'
  }
  if (confirmPassword !== newPassword) errors.confirmPassword = 'Las contraseñas no coinciden.'
  return errors
}
