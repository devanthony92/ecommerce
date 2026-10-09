import { buildCart, findVariant } from '../cart'
import { getDb, save } from '../db'
import { products } from '../fixtures/products'
import { buildPriceView } from '../pricing'
import { fail, ok, requireUser } from '../router'
import { toSummary } from './catalogHandlers'

const MAX_NAME = 40
let sequence = 0
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1)}`

const favoritesOf = (user) => (getDb().favorites[user.id] ??= [])
const listsOf = (user) => (getDb().lists[user.id] ??= [])
const findList = (user, id) => listsOf(user).find((list) => list.id === id)
const touch = (list) => (list.updatedAt = new Date().toISOString())

function toListItem(item, user) {
  const found = findVariant(item.variantId)
  if (!found) return null
  const { product, variant } = found
  const image =
    product.images.find((entry) => entry.color === variant.attributes.color) ?? product.images[0]
  return {
    id: item.id,
    productId: product.id,
    productSlug: product.slug,
    name: product.name,
    image: { url: image.url, alt: image.alt },
    variant: {
      id: variant.id,
      sku: variant.sku,
      attributes: variant.attributes,
      stock: variant.stock,
    },
    available: variant.available,
    quantity: item.quantity,
    pricing: buildPriceView(product, user, item.quantity),
  }
}

function toSummaryList(list) {
  const previews = list.items
    .map((item) => findVariant(item.variantId))
    .filter(Boolean)
    .slice(0, 3)
    .map(({ product, variant }) => {
      const image =
        product.images.find((entry) => entry.color === variant.attributes.color) ??
        product.images[0]
      return { url: image.url, alt: '' }
    })
  return {
    id: list.id,
    name: list.name,
    updatedAt: list.updatedAt,
    itemsCount: list.items.length,
    unitsCount: list.items.reduce((sum, item) => sum + item.quantity, 0),
    previews,
  }
}

function validateName(user, name, exceptId) {
  const clean = name?.trim() ?? ''
  if (!clean) return 'Ponle un nombre a la lista.'
  if (clean.length > MAX_NAME) return `Máximo ${MAX_NAME} caracteres.`
  const taken = listsOf(user).some(
    (list) => list.id !== exceptId && list.name.toLowerCase() === clean.toLowerCase(),
  )
  return taken ? 'Ya tienes una lista con ese nombre.' : null
}

const toQuantity = (value) => Math.floor(Number(value))

export const listHandlers = {
  // ── Favoritos ──
  'GET /favorites': ({ user }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const items = favoritesOf(user)
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => toSummary(product, user))
    return ok(items)
  },

  'PUT /favorites/:productId': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    if (!products.some((product) => product.id === params.productId)) {
      return fail(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.')
    }
    const favorites = favoritesOf(user)
    if (!favorites.includes(params.productId)) favorites.unshift(params.productId)
    save()
    return ok(null, 204)
  },

  'DELETE /favorites/:productId': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    getDb().favorites[user.id] = favoritesOf(user).filter((id) => id !== params.productId)
    save()
    return ok(null, 204)
  },

  // ── Listas ──
  'GET /lists': ({ user }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const lists = [...listsOf(user)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return ok(lists.map(toSummaryList))
  },

  'POST /lists': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const error = validateName(user, body?.name)
    if (error) return fail(400, 'VALIDATION_ERROR', error, { name: error })
    const list = { id: newId('l'), name: body.name.trim(), updatedAt: '', items: [] }
    touch(list)
    listsOf(user).push(list)
    save()
    return ok(toSummaryList(list), 201)
  },

  'GET /lists/:id': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    if (!list) return fail(404, 'LIST_NOT_FOUND', 'La lista no existe.')
    return ok({
      ...toSummaryList(list),
      items: list.items.map((item) => toListItem(item, user)).filter(Boolean),
    })
  },

  'PATCH /lists/:id': ({ user, params, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    if (!list) return fail(404, 'LIST_NOT_FOUND', 'La lista no existe.')
    const error = validateName(user, body?.name, list.id)
    if (error) return fail(400, 'VALIDATION_ERROR', error, { name: error })
    list.name = body.name.trim()
    touch(list)
    save()
    return ok(toSummaryList(list))
  },

  'DELETE /lists/:id': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    getDb().lists[user.id] = listsOf(user).filter((list) => list.id !== params.id)
    save()
    return ok(null, 204)
  },

  // Si la variante ya está en la lista, se suma la cantidad.
  'POST /lists/:id/items': ({ user, params, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    if (!list) return fail(404, 'LIST_NOT_FOUND', 'La lista no existe.')
    if (!findVariant(body?.variantId))
      return fail(404, 'VARIANT_NOT_FOUND', 'El producto no existe.')
    const quantity = toQuantity(body.quantity)
    if (!(quantity > 0)) return fail(400, 'VALIDATION_ERROR', 'La cantidad debe ser mayor a cero.')

    const existing = list.items.find((item) => item.variantId === body.variantId)
    if (existing) existing.quantity += quantity
    else list.items.push({ id: newId('li'), variantId: body.variantId, quantity })
    touch(list)
    save()
    return ok(toSummaryList(list))
  },

  'PATCH /lists/:id/items/:itemId': ({ user, params, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    const item = list?.items.find((entry) => entry.id === params.itemId)
    if (!item) return fail(404, 'LIST_ITEM_NOT_FOUND', 'El producto ya no está en la lista.')
    const quantity = toQuantity(body?.quantity)
    if (!(quantity > 0)) return fail(400, 'VALIDATION_ERROR', 'La cantidad debe ser mayor a cero.')
    item.quantity = quantity
    touch(list)
    save()
    return ok(toListItem(item, user))
  },

  'DELETE /lists/:id/items/:itemId': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    if (!list) return fail(404, 'LIST_NOT_FOUND', 'La lista no existe.')
    list.items = list.items.filter((item) => item.id !== params.itemId)
    touch(list)
    save()
    return ok(null, 204)
  },

  // Agrega al carrito lo disponible; lo agotado viene en warnings.
  'POST /lists/:id/add-to-cart': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const list = findList(user, params.id)
    if (!list) return fail(404, 'LIST_NOT_FOUND', 'La lista no existe.')

    const db = getDb()
    const lines = (db.carts[user.id] ??= [])
    const skipped = []
    for (const item of list.items) {
      const found = findVariant(item.variantId)
      if (!found?.variant.available) {
        if (found) skipped.push(found)
        continue
      }
      const existing = lines.find((line) => line.variantId === item.variantId)
      if (existing) existing.quantity += item.quantity
      else lines.push({ id: newId('ci'), variantId: item.variantId, quantity: item.quantity })
    }

    const cart = buildCart(lines, user, `cart-${user.id}`)
    for (const { product, variant } of skipped) {
      cart.warnings.push({
        code: 'LIST_ITEM_UNAVAILABLE',
        cartItemId: variant.id,
        message: `${product.name} (${variant.attributes.color} / ${variant.attributes.size}) está agotado.`,
      })
    }
    save()
    return ok(cart)
  },
}
