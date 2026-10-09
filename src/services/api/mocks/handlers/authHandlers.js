import { getDb, save, toPublicUser, tokenFor } from '../db'
import { fail, ok, requireUser } from '../router'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESET_TTL_MS = 30 * 60 * 1000

// Mismas reglas que el registro: mínimo 8 caracteres con letras y números.
function passwordError(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres.'
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Usa letras y números.'
  return null
}

export const authHandlers = {
  'POST /auth/login': ({ body }) => {
    const email = body?.email?.trim().toLowerCase()
    const user = getDb().users.find((u) => u.email === email)

    // Mismo mensaje si el correo no existe o la contraseña falla: no revela qué cuentas existen.
    if (!user || user.password !== body?.password) {
      return fail(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.')
    }
    return ok({ token: tokenFor(user), user: toPublicUser(user) })
  },

  'POST /auth/register': ({ body }) => {
    const name = body?.name?.trim()
    const email = body?.email?.trim().toLowerCase()
    const password = body?.password ?? ''

    const details = {}
    if (!name || name.length < 2) details.name = 'Ingresa tu nombre.'
    if (!EMAIL_RE.test(email ?? '')) details.email = 'Ingresa un correo válido.'
    const invalidPassword = passwordError(password)
    if (invalidPassword) details.password = invalidPassword
    if (!body?.acceptTerms) details.acceptTerms = 'Debes aceptar los términos para crear la cuenta.'
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos del formulario.', details)
    }

    const db = getDb()
    if (db.users.some((u) => u.email === email)) {
      return fail(409, 'EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.', {
        email: 'Ya existe una cuenta con ese correo. ¿Quieres ingresar?',
      })
    }

    const user = {
      id: `u-${Date.now()}`,
      name,
      email,
      password,
      phone: null,
      role: 'BUYER',
      wholesale: { requestStatus: null, levelCode: null },
    }
    db.users.push(user)
    save()

    return ok({ token: tokenFor(user), user: toPublicUser(user) }, 201)
  },

  'POST /auth/logout': () => ok(null, 204),

  // Respuesta idéntica exista o no la cuenta (evita enumerar usuarios).
  'POST /auth/password/forgot': ({ body }) => {
    const email = body?.email?.trim().toLowerCase()
    if (!EMAIL_RE.test(email ?? '')) {
      return fail(400, 'VALIDATION_ERROR', 'Ingresa un correo válido.', {
        email: 'Ingresa un correo válido.',
      })
    }

    const db = getDb()
    const user = db.users.find((u) => u.email === email)
    const response = {
      message:
        'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.',
    }

    if (user) {
      const token = `reset-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      db.passwordResets[token] = { userId: user.id, expiresAt: Date.now() + RESET_TTL_MS }
      save()
      // Solo en el mock: no hay correo, así que el enlace se devuelve para la demo.
      // El backend real NUNCA debe devolver este campo.
      response.devResetToken = token
    }

    return ok(response)
  },

  'POST /auth/password/reset': ({ body }) => {
    const db = getDb()
    const reset = db.passwordResets[body?.token]
    if (!reset || reset.expiresAt < Date.now()) {
      return fail(400, 'RESET_TOKEN_INVALID', 'El enlace venció o ya se usó. Solicita uno nuevo.')
    }
    const invalidPassword = passwordError(body?.password ?? '')
    if (invalidPassword) {
      return fail(400, 'VALIDATION_ERROR', invalidPassword, { password: invalidPassword })
    }

    const user = db.users.find((u) => u.id === reset.userId)
    user.password = body.password
    delete db.passwordResets[body.token]
    save()
    return ok({ message: 'Tu contraseña se actualizó. Ya puedes ingresar.' })
  },

  'GET /users/me': ({ user }) => requireUser(user) ?? ok(toPublicUser(user)),

  'PATCH /users/me': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const name = body?.name?.trim() ?? user.name
    const phone = body?.phone?.trim() || null

    const details = {}
    if (name.length < 2) details.name = 'Ingresa tu nombre.'
    if (phone && !/^3\d{9}$/.test(phone)) details.phone = 'Celular de 10 dígitos que empiece por 3.'
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos del perfil.', details)
    }

    Object.assign(user, { name, phone })
    save()
    return ok(toPublicUser(user))
  },

  'POST /users/me/password': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    if (user.password !== body?.currentPassword) {
      return fail(400, 'INVALID_PASSWORD', 'La contraseña actual no es correcta.', {
        currentPassword: 'La contraseña actual no es correcta.',
      })
    }
    const invalidPassword = passwordError(body?.newPassword ?? '')
    if (invalidPassword) {
      return fail(400, 'VALIDATION_ERROR', invalidPassword, { newPassword: invalidPassword })
    }
    user.password = body.newPassword
    save()
    return ok({ message: 'Tu contraseña se actualizó.' })
  },
}
