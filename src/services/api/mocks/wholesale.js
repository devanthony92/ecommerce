// Reglas del programa mayorista en el backend simulado.
import { findLevel, levels } from './fixtures/levels'

const YEAR = '2026'

const isCountable = (order) => order.status !== 'CANCELLED' && order.createdAt.startsWith(YEAR)

export function yearOrders(db, user) {
  return db.orders.filter((order) => order.userId === user.id && isCountable(order))
}

// Compra acumulada del año: base histórica (compras previas a la demo) + pedidos del año.
export function accumulatedFor(db, user) {
  const fromOrders = yearOrders(db, user).reduce((sum, order) => sum + order.summary.total, 0)
  return (user.wholesale.accumulatedBase ?? 0) + fromOrders
}

export function savingsFor(db, user) {
  const fromOrders = yearOrders(db, user).reduce(
    (sum, order) => sum + order.summary.discountTotal,
    0,
  )
  return (user.wholesale.savingsBase ?? 0) + fromOrders
}

// Nivel más alto cuyo tope mínimo ya se alcanzó.
export function levelForAmount(amount) {
  return [...levels].reverse().find((level) => amount >= level.minPurchase) ?? levels[0]
}

export function profileFor(db, user) {
  const accumulated = accumulatedFor(db, user)
  const current = findLevel(user.wholesale.levelCode) ?? levels[0]
  const next = levels[levels.indexOf(current) + 1] ?? null
  const progressPercent = next
    ? Math.min(
        100,
        Math.round(
          ((accumulated - current.minPurchase) / (next.minPurchase - current.minPurchase)) * 100,
        ),
      )
    : 100

  return {
    currentLevel: {
      code: current.code,
      name: current.name,
      discountPercent: current.discountPercent,
    },
    accumulatedPurchase: accumulated,
    period: { from: `${YEAR}-01-01`, to: `${YEAR}-12-31` },
    nextLevel: next && {
      code: next.code,
      name: next.name,
      minPurchase: next.minPurchase,
      discountPercent: next.discountPercent,
    },
    amountToNextLevel: next ? Math.max(0, next.minPurchase - accumulated) : 0,
    progressPercent,
    totalSavings: savingsFor(db, user),
    benefits: current.benefits,
  }
}

/**
 * Recalcula el nivel tras una compra. Devuelve { from, to } si subió de nivel.
 * El nivel nunca baja durante el año.
 */
export function updateLevel(db, user) {
  const current = findLevel(user.wholesale.levelCode) ?? levels[0]
  const reached = levelForAmount(accumulatedFor(db, user))
  if (levels.indexOf(reached) <= levels.indexOf(current)) return null
  user.wholesale.levelCode = reached.code
  return { from: current.name, to: reached.name, discountPercent: reached.discountPercent }
}
