// Páginas visibles: primera, última y vecinas de la actual, con "…" en los saltos.
export function getPageItems(page, totalPages, siblings = 1) {
  const pages = new Set([1, totalPages])
  for (let p = page - siblings; p <= page + siblings; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((p, index) =>
    index > 0 && p - sorted[index - 1] > 1 ? [`gap-${p}`, p] : [p],
  )
}
