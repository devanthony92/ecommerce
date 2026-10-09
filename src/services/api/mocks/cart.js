// Armado del Cart del contrato (§7). En producción vive en el backend.
import { products } from './fixtures/products'
import { program } from './fixtures/program'
import { buildPriceView } from './pricing'

export const FREE_SHIPPING_THRESHOLD = 120000
export const SHIPPING_COST = 10000

const variantIndex = new Map(
  products.flatMap((product) =>
    product.variants.map((variant) => [variant.id, { product, variant }]),
  ),
)

export const findVariant = (variantId) => variantIndex.get(variantId) ?? null

const variantLabel = (variant) => `${variant.attributes.color} / ${variant.attributes.size}`

/**
 * lines: [{ id, variantId, quantity }]. Ajusta cantidades al stock (mutando
 * las líneas, para que el carrito guardado quede corregido) y calcula precios.
 *
 * Regla comercial: la escala por cantidad usa el total de unidades del mismo
 * producto en el carrito, sumando tallas y colores.
 */
export function buildCart(lines, user, cartId = 'guest') {
  const warnings = []

  const resolved = lines
    .map((line) => ({ line, ...findVariant(line.variantId) }))
    .filter((entry) => entry.product)

  for (const { line, product, variant } of resolved) {
    if (variant.available && line.quantity > variant.stock) {
      line.quantity = variant.stock
      warnings.push({
        code: 'STOCK_REDUCED',
        cartItemId: line.id,
        message: `Solo hay ${variant.stock} unidades de ${product.name} (${variantLabel(variant)}). Ajustamos la cantidad.`,
      })
    }
    if (!variant.available) {
      warnings.push({
        code: 'OUT_OF_STOCK',
        cartItemId: line.id,
        message: `${product.name} (${variantLabel(variant)}) se agotó. No se incluye en el total.`,
      })
    }
  }

  const unitsByProduct = new Map()
  for (const { line, product, variant } of resolved) {
    if (!variant.available) continue
    unitsByProduct.set(product.id, (unitsByProduct.get(product.id) ?? 0) + line.quantity)
  }

  const items = resolved.map(({ line, product, variant }) => {
    const productUnits = unitsByProduct.get(product.id) ?? line.quantity
    const view = buildPriceView(product, user, productUnits)
    const unitSavings = view.listPrice - view.unitPrice
    const image =
      product.images.find((item) => item.color === variant.attributes.color) ?? product.images[0]

    return {
      id: line.id,
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
      quantity: line.quantity,
      // Unidades del producto que definen la escala (todas sus variantes en el carrito).
      productQuantity: productUnits,
      pricing: {
        ...view,
        quantity: line.quantity,
        lineTotal: view.unitPrice * line.quantity,
        savings: {
          unit: unitSavings,
          total: unitSavings * line.quantity,
          percent: view.savings.percent,
        },
      },
      // Para cambiar talla o color desde el carrito.
      variantOptions: product.variants.map((option) => ({
        id: option.id,
        attributes: option.attributes,
        available: option.available,
      })),
    }
  })

  const billable = items.filter((item) => item.available)
  const itemsTotal = billable.reduce((sum, item) => sum + item.pricing.lineTotal, 0)
  const subtotal = billable.reduce((sum, item) => sum + item.pricing.listPrice * item.quantity, 0)
  const discountTotal = subtotal - itemsTotal
  const freeShipping = itemsTotal >= FREE_SHIPPING_THRESHOLD
  const shipping = billable.length === 0 || freeShipping ? 0 : SHIPPING_COST

  const incentives = []
  for (const [productId, units] of unitsByProduct) {
    const product = products.find((item) => item.id === productId)
    const { nextTier } = buildPriceView(product, user, units)
    if (!nextTier) continue
    incentives.push({
      type: 'QUANTITY_TIER',
      productId,
      productName: product.name,
      current: units,
      target: nextTier.minQty,
      remaining: nextTier.unitsToReach,
      targetLabel: nextTier.label,
      targetUnitPrice: nextTier.unitPrice,
      progressPercent: Math.round((units / nextTier.minQty) * 100),
    })
  }
  if (billable.length > 0) {
    incentives.push({
      type: 'FREE_SHIPPING',
      achieved: freeShipping,
      current: itemsTotal,
      target: FREE_SHIPPING_THRESHOLD,
      remaining: Math.max(0, FREE_SHIPPING_THRESHOLD - itemsTotal),
      progressPercent: Math.min(100, Math.round((itemsTotal / FREE_SHIPPING_THRESHOLD) * 100)),
    })
  }

  // Pedido mínimo: solo aplica a mayoristas y se mide con el valor de los productos.
  const minimumOrder =
    user?.role === 'WHOLESALE'
      ? {
          amount: program.minimumOrder,
          remaining: Math.max(0, program.minimumOrder - itemsTotal),
          met: itemsTotal >= program.minimumOrder,
        }
      : null

  return {
    id: cartId,
    items,
    summary: {
      itemsCount: billable.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discountTotal,
      shipping,
      total: itemsTotal + shipping,
      savingsTotal: discountTotal,
    },
    incentives,
    warnings,
    minimumOrder,
  }
}
