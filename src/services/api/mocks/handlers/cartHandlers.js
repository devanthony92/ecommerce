import { buildCart, findVariant } from '../cart'
import { getDb, save } from '../db'
import { fail, ok, requireUser } from '../router'

let sequence = 0
const newLineId = () => `ci-${Date.now().toString(36)}-${(sequence += 1)}`

function linesOf(user) {
  const db = getDb()
  db.carts[user.id] ??= []
  return db.carts[user.id]
}

function respond(user) {
  const cart = buildCart(linesOf(user), user, `cart-${user.id}`)
  save()
  return ok(cart)
}

const toQuantity = (value) => Math.floor(Number(value))

// Suma unidades a una línea existente de la variante o crea una nueva.
function addLine(lines, variantId, quantity) {
  const existing = lines.find((line) => line.variantId === variantId)
  if (existing) existing.quantity += quantity
  else lines.push({ id: newLineId(), variantId, quantity })
}

function validateAdd({ variantId, quantity }) {
  const found = findVariant(variantId)
  if (!found) return fail(404, 'VARIANT_NOT_FOUND', 'El producto no existe.')
  if (!found.variant.available) {
    return fail(409, 'OUT_OF_STOCK', `${found.product.name} está agotado en esa talla y color.`)
  }
  if (!(toQuantity(quantity) > 0)) {
    return fail(400, 'VALIDATION_ERROR', 'La cantidad debe ser mayor a cero.')
  }
  return null
}

export const cartHandlers = {
  'GET /cart': ({ user }) => requireUser(user) ?? respond(user),

  'POST /cart/items': ({ user, body }) => {
    const error = requireUser(user) ?? validateAdd(body ?? {})
    if (error) return error
    addLine(linesOf(user), body.variantId, toQuantity(body.quantity))
    return respond(user)
  },

  'POST /cart/items/bulk': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const lines = linesOf(user)
    // Los ítems sin stock se omiten; el resto se agrega.
    for (const item of body?.items ?? []) {
      if (!validateAdd(item)) addLine(lines, item.variantId, toQuantity(item.quantity))
    }
    return respond(user)
  },

  'PATCH /cart/items/:itemId': ({ user, params, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const lines = linesOf(user)
    const line = lines.find((item) => item.id === params.itemId)
    if (!line) return fail(404, 'CART_ITEM_NOT_FOUND', 'El producto ya no está en tu carrito.')

    if (body?.variantId && body.variantId !== line.variantId) {
      const found = findVariant(body.variantId)
      if (!found?.variant.available) {
        return fail(409, 'OUT_OF_STOCK', 'Esa combinación no tiene stock.')
      }
      // Si la nueva variante ya está en el carrito, se unen las líneas.
      const target = lines.find((item) => item.variantId === body.variantId)
      if (target) {
        target.quantity += line.quantity
        lines.splice(lines.indexOf(line), 1)
      } else {
        line.variantId = body.variantId
      }
    }

    if (body?.quantity !== undefined) {
      const quantity = toQuantity(body.quantity)
      if (quantity <= 0) lines.splice(lines.indexOf(line), 1)
      else line.quantity = quantity
    }

    return respond(user)
  },

  'DELETE /cart/items/:itemId': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const lines = linesOf(user)
    const index = lines.findIndex((item) => item.id === params.itemId)
    if (index >= 0) lines.splice(index, 1)
    return respond(user)
  },

  // Al iniciar sesión: el carrito de invitado se suma al del usuario.
  'POST /cart/merge': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const lines = linesOf(user)
    for (const item of body?.items ?? []) {
      if (findVariant(item.variantId) && toQuantity(item.quantity) > 0) {
        addLine(lines, item.variantId, toQuantity(item.quantity))
      }
    }
    return respond(user)
  },

  // Invitado: calcula el carrito sin guardarlo. El id de cada ítem es su variantId.
  'POST /cart/quote': ({ user, body }) => {
    const lines = (body?.items ?? [])
      .filter((item) => toQuantity(item.quantity) > 0)
      .map((item) => ({
        id: item.variantId,
        variantId: item.variantId,
        quantity: toQuantity(item.quantity),
      }))
    return ok(buildCart(lines, user))
  },
}
