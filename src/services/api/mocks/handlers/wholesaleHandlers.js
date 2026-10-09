import { categories } from '../fixtures/categories'
import { program } from '../fixtures/program'
import { getDb, save } from '../db'
import { fail, ok, requireUser } from '../router'
import { profileFor } from '../wholesale'
import { findVariant } from '../cart'
import { buildPriceView } from '../pricing'

const NIT_RE = /^\d{6,10}(-\d)?$/
const PHONE_RE = /^3\d{9}$/
const BUSINESS_TYPES = ['PHYSICAL_STORE', 'ONLINE_STORE', 'CATALOG', 'DISTRIBUTOR', 'OTHER']
const VOLUMES = ['UNDER_1M', '1M_5M', '5M_10M', 'OVER_10M']

function validate(body) {
  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  const details = {}
  if (!text(body.tradeName)) details.tradeName = 'Ingresa el nombre de tu negocio.'
  if (!text(body.legalName)) details.legalName = 'Ingresa la razón social o tu nombre completo.'
  if (!NIT_RE.test(text(body.nit))) details.nit = 'NIT o cédula sin puntos (ej. 900123456-7).'
  if (!PHONE_RE.test(text(body.phone))) details.phone = 'Celular de 10 dígitos que empiece por 3.'
  if (!text(body.city)) details.city = 'Ingresa la ciudad.'
  if (text(body.address).length < 5) details.address = 'Ingresa la dirección del negocio.'
  if (!BUSINESS_TYPES.includes(body.businessType))
    details.businessType = 'Elige el tipo de negocio.'
  if (!VOLUMES.includes(body.estimatedMonthlyVolume)) {
    details.estimatedMonthlyVolume = 'Elige un volumen estimado.'
  }
  const validCategories = (body.categoriesOfInterest ?? []).filter((id) =>
    categories.some((category) => category.id === id),
  )
  if (validCategories.length === 0) {
    details.categoriesOfInterest = 'Elige al menos una categoría.'
  }
  return { details, validCategories }
}

const requestOf = (user) => getDb().wholesaleRequests[user.id] ?? null

export const wholesaleHandlers = {
  'GET /wholesale/program': () => ok(program),

  'GET /wholesale/profile': ({ user }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    if (user.role !== 'WHOLESALE') {
      return fail(403, 'FORBIDDEN', 'Esta sección es solo para cuentas mayoristas.')
    }
    return ok(profileFor(getDb(), user))
  },

  // Variantes que más compra, con su cantidad habitual (promedio por pedido).
  'GET /wholesale/frequent-products': ({ user }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    if (user.role !== 'WHOLESALE') {
      return fail(403, 'FORBIDDEN', 'Esta sección es solo para cuentas mayoristas.')
    }

    const byVariant = new Map()
    for (const order of getDb().orders) {
      if (order.userId !== user.id || order.status === 'CANCELLED') continue
      for (const item of order.items) {
        const entry = byVariant.get(item.variant.id) ?? { times: 0, units: 0, last: '' }
        entry.times += 1
        entry.units += item.quantity
        if (order.createdAt > entry.last) entry.last = order.createdAt
        byVariant.set(item.variant.id, entry)
      }
    }

    const items = [...byVariant]
      .map(([variantId, entry]) => {
        const found = findVariant(variantId)
        if (!found) return null
        const { product, variant } = found
        const usualQuantity = Math.max(1, Math.round(entry.units / entry.times))
        const image =
          product.images.find((item) => item.color === variant.attributes.color) ??
          product.images[0]
        return {
          variant: {
            id: variant.id,
            sku: variant.sku,
            attributes: variant.attributes,
            available: variant.available,
            stock: variant.stock,
          },
          product: {
            slug: product.slug,
            name: product.name,
            image: { url: image.url, alt: image.alt },
          },
          usualQuantity,
          timesOrdered: entry.times,
          lastOrderedAt: entry.last,
          pricing: buildPriceView(product, user, usualQuantity),
        }
      })
      .filter(Boolean)
      .sort(
        (a, b) => b.timesOrdered - a.timesOrdered || b.lastOrderedAt.localeCompare(a.lastOrderedAt),
      )

    return ok(items)
  },

  'GET /wholesale/requests/me': ({ user }) => requireUser(user) ?? ok(requestOf(user)),

  'POST /wholesale/requests': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized

    // Las reglas del backend deciden quién puede solicitar (mismo criterio que el permiso).
    if (![null, 'REJECTED'].includes(user.wholesale.requestStatus)) {
      return fail(409, 'REQUEST_NOT_ALLOWED', 'Ya tienes una solicitud o una cuenta mayorista.')
    }

    const { details, validCategories } = validate(body ?? {})
    if (Object.keys(details).length) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos de la solicitud.', details)
    }

    const request = {
      id: `wr-${Date.now().toString(36)}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      rejectionReason: null,
      data: {
        tradeName: body.tradeName.trim(),
        legalName: body.legalName.trim(),
        nit: body.nit.trim(),
        phone: body.phone.trim(),
        city: body.city.trim(),
        address: body.address.trim(),
        businessType: body.businessType,
        socialLinks: body.socialLinks?.trim() || null,
        estimatedMonthlyVolume: body.estimatedMonthlyVolume,
        categoriesOfInterest: validCategories,
      },
    }

    getDb().wholesaleRequests[user.id] = request
    user.wholesale.requestStatus = 'PENDING'
    save()
    return ok(request, 201)
  },

  /**
   * SOLO DEMO: simula la revisión administrativa (no existe en el backend real,
   * donde la decide un administrador). Lo usa el panel de simulación del mock.
   */
  'POST /_dev/wholesale-review': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const request = requestOf(user)
    if (!request) return fail(404, 'REQUEST_NOT_FOUND', 'No hay solicitud para revisar.')

    const status = body?.status
    if (!['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return fail(400, 'VALIDATION_ERROR', 'Estado no válido.')
    }

    request.status = status
    request.reviewedAt = status === 'UNDER_REVIEW' ? null : new Date().toISOString()
    request.rejectionReason =
      status === 'REJECTED'
        ? (body.rejectionReason ?? 'No pudimos verificar el NIT del negocio.')
        : null

    user.wholesale.requestStatus = status
    user.role = status === 'APPROVED' ? 'WHOLESALE' : 'BUYER'
    save()
    return ok({ request })
  },
}
