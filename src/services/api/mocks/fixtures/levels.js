// Niveles mayoristas. En el backend real son configurables.
export const levels = [
  {
    code: 'BRONZE',
    name: 'BRONCE',
    minPurchase: 0,
    maxPurchase: 499999,
    discountPercent: 5,
    benefits: [{ code: 'TIER_PRICES', label: 'Precios por volumen + 5%' }],
  },
  {
    code: 'SILVER',
    name: 'PLATA',
    minPurchase: 500000,
    maxPurchase: 1999999,
    discountPercent: 8,
    benefits: [
      { code: 'TIER_PRICES', label: 'Precios por volumen + 8%' },
      { code: 'PRIORITY_SUPPORT', label: 'Asesor comercial' },
    ],
  },
  {
    code: 'GOLD',
    name: 'ORO',
    minPurchase: 2000000,
    maxPurchase: 4999999,
    discountPercent: 12,
    benefits: [
      { code: 'TIER_PRICES', label: 'Precios por volumen + 12%' },
      { code: 'PRIORITY_SUPPORT', label: 'Asesor comercial' },
      { code: 'PRESALES', label: 'Acceso a preventas' },
    ],
  },
  {
    code: 'PLATINUM',
    name: 'PLATINO',
    minPurchase: 5000000,
    maxPurchase: null,
    discountPercent: 15,
    benefits: [
      { code: 'TIER_PRICES', label: 'Precios por volumen + 15%' },
      { code: 'PRIORITY_SUPPORT', label: 'Asesor comercial' },
      { code: 'PRESALES', label: 'Acceso a preventas' },
      { code: 'FREE_SHIPPING', label: 'Envío gratis en todos los pedidos' },
    ],
  },
]

export const findLevel = (code) => levels.find((level) => level.code === code) ?? null
