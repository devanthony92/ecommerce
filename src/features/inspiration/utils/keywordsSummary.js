/**
 * Palabras clave de las inspiraciones guardadas, de la más usada a la menos.
 * Hasta tres se muestran todas ("Denim, Oficina y Verano"); con más, las dos
 * primeras y cuántas faltan ("Denim, Oficina y 2 más").
 */
export function keywordsSummary(inspirations) {
  const counts = new Map()
  for (const { keyword } of inspirations) {
    counts.set(keyword, (counts.get(keyword) ?? 0) + 1)
  }
  // Map conserva el orden de aparición: el desempate es estable.
  const keywords = [...counts].sort((a, b) => b[1] - a[1]).map(([keyword]) => keyword)

  if (keywords.length === 0) return ''
  if (keywords.length === 1) return keywords[0]
  if (keywords.length <= 3) return `${keywords.slice(0, -1).join(', ')} y ${keywords.at(-1)}`
  return `${keywords[0]}, ${keywords[1]} y ${keywords.length - 2} más`
}
