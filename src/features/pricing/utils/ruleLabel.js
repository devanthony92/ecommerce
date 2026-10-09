// Texto corto para cada regla aplicada del PriceView ("por qué ves este precio").
export function ruleLabel(rule) {
  switch (rule.type) {
    case 'WHOLESALE_LEVEL':
      return `${rule.label} −${rule.percent}%`
    case 'QUANTITY_TIER':
      return `Precio por ${rule.label.toLowerCase()}`
    case 'PROMOTION':
    default:
      return rule.label
  }
}

export const unitsLabel = (count) => `${count} ${count === 1 ? 'unidad' : 'unidades'}`
