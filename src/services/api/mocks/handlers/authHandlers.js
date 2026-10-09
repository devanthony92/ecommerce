import { getDb, save, toPublicUser, tokenFor } from '../db'
import { fail, ok, requireUser } from '../router'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const authHandlers = {
  'POST /auth/login': ({ body }) => {
    const email = body?.email?.trim().toLowerCase()
    const user = getDb().users.find((u) => u.email === email)

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
    if (!name) details.name = 'Ingresa tu nombre.'
    if (!EMAIL_RE.test(email ?? '')) details.email = 'Ingresa un correo válido.'
    if (password.length < 8) details.password = 'Mínimo 8 caracteres.'
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos del formulario.', details)
    }

    const db = getDb()
    if (db.users.some((u) => u.email === email)) {
      return fail(409, 'EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.')
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

  'GET /users/me': ({ user }) => requireUser(user) ?? ok(toPublicUser(user)),
}
