import { DEPARTMENTS } from '@/constants/colombia'
import { getDb, save } from '../db'
import { fail, ok, requireUser } from '../router'

const PHONE_RE = /^3\d{9}$/

export function addressesOf(user) {
  const db = getDb()
  db.addresses[user.id] ??= []
  return db.addresses[user.id]
}

function validate(body) {
  const details = {}
  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  if (!text(body.label)) details.label = 'Ponle un nombre, por ejemplo "Casa" o "Tienda".'
  if (!text(body.recipient)) details.recipient = 'Ingresa quién recibe.'
  if (!PHONE_RE.test(text(body.phone))) details.phone = 'Celular de 10 dígitos que empiece por 3.'
  if (!DEPARTMENTS.includes(body.department)) details.department = 'Elige un departamento.'
  if (!text(body.city)) details.city = 'Ingresa la ciudad o municipio.'
  if (text(body.line1).length < 5) details.line1 = 'Ingresa la dirección completa.'
  return details
}

function normalize(body) {
  const optional = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)
  return {
    label: body.label.trim(),
    recipient: body.recipient.trim(),
    phone: body.phone.trim(),
    department: body.department,
    city: body.city.trim(),
    line1: body.line1.trim(),
    line2: optional(body.line2),
    notes: optional(body.notes),
  }
}

export const addressHandlers = {
  'GET /users/me/addresses': ({ user }) => requireUser(user) ?? ok(addressesOf(user)),

  'POST /users/me/addresses': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const details = validate(body ?? {})
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos de la dirección.', details)
    }

    const addresses = addressesOf(user)
    const isDefault = Boolean(body.isDefault) || addresses.length === 0
    if (isDefault) addresses.forEach((address) => (address.isDefault = false))
    const address = { id: `a-${Date.now().toString(36)}`, ...normalize(body), isDefault }
    addresses.push(address)
    save()
    return ok(address, 201)
  },

  'PATCH /users/me/addresses/:id': ({ user, params, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const addresses = addressesOf(user)
    const address = addresses.find((item) => item.id === params.id)
    if (!address) return fail(404, 'ADDRESS_NOT_FOUND', 'La dirección no existe.')

    const merged = { ...address, ...body }
    const details = validate(merged)
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos de la dirección.', details)
    }
    if (body.isDefault) addresses.forEach((item) => (item.isDefault = false))
    Object.assign(address, normalize(merged), { isDefault: Boolean(merged.isDefault) })
    save()
    return ok(address)
  },

  'DELETE /users/me/addresses/:id': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const addresses = addressesOf(user)
    const index = addresses.findIndex((item) => item.id === params.id)
    if (index >= 0) {
      const [removed] = addresses.splice(index, 1)
      if (removed.isDefault && addresses[0]) addresses[0].isDefault = true
      save()
    }
    return ok(null, 204)
  },
}
