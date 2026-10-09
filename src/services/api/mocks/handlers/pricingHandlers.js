import { products } from '../fixtures/products'
import { buildPriceView } from '../pricing'
import { fail, ok } from '../router'

function findByVariant(variantId) {
  return products.find((product) => product.variants.some((variant) => variant.id === variantId))
}

export const pricingHandlers = {
  'POST /pricing/quote': ({ body, user }) => {
    const items = body?.items ?? []
    const quoted = []

    for (const { variantId, quantity } of items) {
      const product = findByVariant(variantId)
      if (!product) {
        return fail(404, 'VARIANT_NOT_FOUND', 'Una de las variantes no existe.', { variantId })
      }
      const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
      quoted.push({ variantId, pricing: buildPriceView(product, user, safeQuantity) })
    }

    return ok({ items: quoted })
  },
}
