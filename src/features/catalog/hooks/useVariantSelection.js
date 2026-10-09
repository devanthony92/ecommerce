import { useMemo, useState } from 'react'

const isAvailable = (variant) => Boolean(variant?.available)

/**
 * Estado de color + talla de un producto y la variante resultante.
 * - Color inicial: `initialColor` si existe y tiene stock, si no el primero con stock.
 * - Talla: se elige explícitamente, salvo que haya una sola (p. ej. "Única").
 */
export function useVariantSelection(product, initialColor) {
  const [colorOption, sizeOption] = product.options
  const colors = colorOption.values
  const sizes = sizeOption.values

  const findVariant = (color, size) =>
    product.variants.find(
      (variant) => variant.attributes.color === color && variant.attributes.size === size,
    )

  const colorHasStock = (color) => sizes.some((size) => isAvailable(findVariant(color, size)))

  const [color, setColor] = useState(() => {
    if (initialColor && colors.includes(initialColor) && colorHasStock(initialColor)) {
      return initialColor
    }
    return colors.find(colorHasStock) ?? colors[0]
  })
  const [selectedSize, setSelectedSize] = useState(sizes.length === 1 ? sizes[0] : null)

  const sizeStates = useMemo(
    () =>
      sizes.map((size) => {
        const variant = product.variants.find(
          (item) => item.attributes.color === color && item.attributes.size === size,
        )
        return { size, available: isAvailable(variant), stock: variant?.stock ?? 0 }
      }),
    [product.variants, sizes, color],
  )

  // Si la talla elegida no existe en el nuevo color, se descarta (derivado, sin efecto).
  const size = sizeStates.some((state) => state.size === selectedSize && state.available)
    ? selectedSize
    : sizes.length === 1
      ? sizes[0]
      : null

  const variant = size ? findVariant(color, size) : null

  return {
    colors: colors.map((value) => ({ value, available: colorHasStock(value) })),
    sizeStates,
    color,
    size,
    variant,
    setColor,
    setSize: setSelectedSize,
  }
}
