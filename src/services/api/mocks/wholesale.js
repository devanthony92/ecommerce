// Reglas del programa mayorista en el backend simulado.
import { program } from './fixtures/program'

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

export function profileFor(db, user) {
  return {
    accumulatedPurchase: accumulatedFor(db, user),
    period: { from: `${YEAR}-01-01`, to: `${YEAR}-12-31` },
    totalSavings: savingsFor(db, user),
    minimumOrder: program.minimumOrder,
    benefits: program.benefits,
  }
}
