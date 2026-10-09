import { buildCart, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../cart'
import { getDb, save } from '../db'
import { fail, ok, requireUser } from '../router'
import { addressesOf } from './addressHandlers'

const EXPRESS_CITIES = ['Medellín', 'Bogotá', 'Bogotá D.C.', 'Cali', 'Barranquilla']

const PAYMENT_METHODS = {
  // Pago simulado: se aprueba al instante. No existe pasarela real.
  CARD: { label: 'Tarjeta débito o crédito', status: 'PAID' },
  PSE: { label: 'PSE', status: 'PAID' },
  CASH_ON_DELIVERY: { label: 'Pago contra entrega', status: 'PROCESSING' },
}

function cartOf(user) {
  const db = getDb()
  return buildCart(db.carts[user.id] ?? [], user, `cart-${user.id}`)
}

// Las opciones y el total por opción los calcula el backend.
function shippingOptions(cart, address) {
  const itemsTotal = cart.summary.total - cart.summary.shipping
  const freeStandard = itemsTotal >= FREE_SHIPPING_THRESHOLD
  const options = [
    {
      id: 'standard',
      label: 'Envío estándar',
      description: freeStandard ? 'Gratis por compras desde $200.000' : 'Transportadora nacional',
      price: freeStandard ? 0 : SHIPPING_COST,
      estimatedDays: '3 a 5 días hábiles',
    },
  ]
  if (EXPRESS_CITIES.includes(address.city)) {
    options.push({
      id: 'express',
      label: 'Envío express',
      description: 'Para ciudades principales',
      price: 24000,
      estimatedDays: '1 a 2 días hábiles',
    })
  }
  options.push({
    id: 'pickup',
    label: 'Recoger en bodega',
    description: 'Calle 30 # 65-12, Medellín',
    price: 0,
    estimatedDays: 'Listo en 1 día hábil',
  })
  return options.map((option) => ({ ...option, total: itemsTotal + option.price }))
}

const ownOrder = (user, id) =>
  getDb().orders.find((order) => order.id === id && order.userId === user.id)

function toPublicOrder({ userId: _userId, ...order }) {
  return {
    ...order,
    canCancel: ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.status),
    canReorder: true,
  }
}

export const orderHandlers = {
  'GET /checkout/shipping-options': ({ user, query }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const address = addressesOf(user).find((item) => item.id === query.addressId)
    if (!address) return fail(404, 'ADDRESS_NOT_FOUND', 'Elige una dirección válida.')
    return ok(shippingOptions(cartOf(user), address))
  },

  'POST /orders': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized

    const db = getDb()
    const cart = cartOf(user)
    const items = cart.items.filter((item) => item.available)
    if (items.length === 0) {
      return fail(422, 'CART_EMPTY', 'Tu carrito no tiene productos disponibles.')
    }
    const address = addressesOf(user).find((item) => item.id === body?.addressId)
    if (!address) return fail(422, 'ADDRESS_REQUIRED', 'Elige una dirección de entrega.')
    const option = shippingOptions(cart, address).find((item) => item.id === body.shippingOptionId)
    if (!option) return fail(422, 'SHIPPING_REQUIRED', 'Elige una opción de envío.')
    const payment = PAYMENT_METHODS[body.paymentMethod]
    if (!payment) return fail(422, 'PAYMENT_REQUIRED', 'Elige un medio de pago.')

    db.orderSequence += 1
    const order = {
      id: `o-${Date.now().toString(36)}`,
      userId: user.id,
      number: `PED-${String(db.orderSequence).padStart(6, '0')}`,
      createdAt: new Date().toISOString(),
      status: payment.status,
      items: items.map((item) => ({
        productId: item.productId,
        productSlug: item.productSlug,
        name: item.name,
        image: item.image,
        variant: { id: item.variant.id, attributes: item.variant.attributes },
        quantity: item.quantity,
        unitPrice: item.pricing.unitPrice,
        lineTotal: item.pricing.lineTotal,
      })),
      summary: {
        itemsCount: cart.summary.itemsCount,
        subtotal: cart.summary.subtotal,
        discountTotal: cart.summary.discountTotal,
        shipping: option.price,
        total: option.total,
      },
      address: { ...address },
      shipping: { id: option.id, label: option.label, estimatedDays: option.estimatedDays },
      payment: { method: body.paymentMethod, label: payment.label },
      notes: body.notes?.trim() || null,
    }

    db.orders.push(order)
    db.carts[user.id] = []
    save()
    return ok({ order: toPublicOrder(order), payment: { redirectUrl: null } }, 201)
  },

  'GET /orders': ({ user, query }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = 10
    const mine = getDb()
      .orders.filter((order) => order.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return ok({
      items: mine.slice((page - 1) * pageSize, page * pageSize).map(toPublicOrder),
      page,
      pageSize,
      total: mine.length,
      totalPages: Math.max(1, Math.ceil(mine.length / pageSize)),
    })
  },

  'GET /orders/:id': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const order = ownOrder(user, params.id)
    return order ? ok(toPublicOrder(order)) : fail(404, 'ORDER_NOT_FOUND', 'El pedido no existe.')
  },
}
