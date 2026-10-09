// Niveles mayoristas. En el backend real son configurables.
export const levels = [
  { code: 'BRONZE', name: 'BRONCE', minPurchase: 0, maxPurchase: 499999, discountPercent: 5 },
  { code: 'SILVER', name: 'PLATA', minPurchase: 500000, maxPurchase: 1999999, discountPercent: 8 },
  { code: 'GOLD', name: 'ORO', minPurchase: 2000000, maxPurchase: 4999999, discountPercent: 12 },
  {
    code: 'PLATINUM',
    name: 'PLATINO',
    minPurchase: 5000000,
    maxPurchase: null,
    discountPercent: 15,
  },
]

export const findLevel = (code) => levels.find((level) => level.code === code) ?? null
