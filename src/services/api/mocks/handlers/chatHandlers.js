import { products } from '../fixtures/products'
import { fail, ok } from '../router'
import { toSummary } from './catalogHandlers'

const MAX_MESSAGE_LENGTH = 500

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Asistente simulado: sin Gemini, responde con los productos cuyo nombre coincide.
// El backend real arma el contexto de la tienda y llama al modelo.
export const chatHandlers = {
  'GET /chat/status': () => ok({ enabled: true, whatsapp: '573001234567' }),

  'POST /chat/messages': ({ body, user }) => {
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return fail(400, 'VALIDATION_ERROR', 'Revisa los datos enviados.', {
        message: message
          ? `Debe tener como máximo ${MAX_MESSAGE_LENGTH} caracteres.`
          : 'Campo obligatorio.',
      })
    }

    const words = normalize(message)
      .split(/[^a-z0-9ñ]+/)
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/e?s$/, ''))
    const related = products
      .filter((product) => words.some((word) => normalize(product.name).includes(word)))
      .slice(0, 4)

    return ok({
      reply: related.length
        ? `Encontré ${related.length} ${related.length === 1 ? 'producto' : 'productos'} que pueden servirte.`
        : 'Puedo ayudarte con productos, tallas, precios, envíos y compras por mayor.',
      products: related.map((product) => ({
        ...toSummary(product, user),
        variants: product.variants.map(({ id, attributes, available }) => ({
          id,
          attributes,
          available,
        })),
      })),
    })
  },
}
