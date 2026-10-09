export const EMPTY_CART = Object.freeze({
  id: null,
  items: [],
  summary: { itemsCount: 0, subtotal: 0, discountTotal: 0, shipping: 0, total: 0, savingsTotal: 0 },
  incentives: [],
  warnings: [],
  minimumOrder: null,
})

export const variantLabel = (attributes) => `${attributes.color} / ${attributes.size}`
