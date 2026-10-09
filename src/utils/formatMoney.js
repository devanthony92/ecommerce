// Dinero llega en enteros COP (35000 = $35.000). Única utilidad monetaria del front.
const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatMoney(amount) {
  return formatter.format(amount ?? 0)
}
