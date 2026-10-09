// Fechas ISO del backend → texto en español de Colombia ("9 oct 2026").
const formatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(isoDate) {
  return formatter.format(new Date(isoDate)).replace('.', '')
}
