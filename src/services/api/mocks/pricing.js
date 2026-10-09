// Motor de precios simulado. En producción esta lógica vive SOLO en el backend;
// el frontend nunca calcula precios (docs/ARCHITECTURE.md §10).
import { findLevel } from './fixtures/levels'

const roundCop = (amount) => Math.round(amount / 100) * 100

export function audienceFor(user) {
  if (!user) return 'PUBLIC'
  return user.role === 'WHOLESALE' ? 'WHOLESALE' : 'BUYER'
}

/**
 * Cadena: precio base → promoción → escala por cantidad → nivel mayorista.
 * Devuelve el PriceView del contrato.
 */
export function buildPriceView(product, user, quantity = 1) {
  const audience = audienceFor(user)
  const level = audience === 'WHOLESALE' ? findLevel(user.wholesale.levelCode) : null
  const levelPercent = level?.discountPercent ?? 0
  const listPrice = product.basePrice
  const baseUnit = product.promoPrice ?? listPrice

  const priceForTier = (def) =>
    roundCop(baseUnit * (1 - def.discountPercent / 100) * (1 - levelPercent / 100))

  const defs = product.tierDefs
  const current = [...defs].reverse().find((def) => def.minQty <= quantity) ?? defs[0]
  const next = defs.find((def) => def.minQty > quantity) ?? null
  const unitPrice = priceForTier(current)

  const tiers =
    defs.length > 1
      ? defs.map((def, index) => {
          const tierPrice = priceForTier(def)
          return {
            minQty: def.minQty,
            label: def.label,
            unitPrice: tierPrice,
            savingsPercent: Math.round((1 - tierPrice / listPrice) * 100),
            isCurrent: def === current,
            isBest: index === defs.length - 1,
          }
        })
      : []

  const appliedRules = []
  if (product.promoPrice) {
    appliedRules.push({ type: 'PROMOTION', label: 'Precio de temporada' })
  }
  if (current.minQty > 1) {
    appliedRules.push({ type: 'QUANTITY_TIER', label: current.label, minQty: current.minQty })
  }
  if (level) {
    appliedRules.push({
      type: 'WHOLESALE_LEVEL',
      label: `Nivel ${level.name}`,
      percent: level.discountPercent,
    })
  }

  const unitSavings = listPrice - unitPrice

  return {
    currency: 'COP',
    audience,
    quantity,
    listPrice,
    unitPrice,
    compareAtPrice: product.promoPrice ? listPrice : null,
    lineTotal: unitPrice * quantity,
    savings: {
      unit: unitSavings,
      total: unitSavings * quantity,
      percent: Math.round((unitSavings / listPrice) * 100),
    },
    appliedRules,
    tiers,
    nextTier: next && {
      minQty: next.minQty,
      label: next.label,
      unitPrice: priceForTier(next),
      unitsToReach: next.minQty - quantity,
    },
  }
}
