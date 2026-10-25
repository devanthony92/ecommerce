import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useToast } from '@/components/feedback'
import { Button, Price, ResponsiveImage, SelectField } from '@/components/ui'
import { paths } from '@/constants/paths'
import { useCart } from '@/features/cart'
import './chat-product.scss'

const colorsWithStock = (variants) => [
  ...new Set(variants.filter((v) => v.available).map((v) => v.attributes.color)),
]

/**
 * Tarjeta de un producto sugerido por el asistente. "Agregar" despliega color y talla
 * (solo las combinaciones con stock) y agrega 1 unidad con el carrito de la tienda.
 */
export function ChatProduct({ product }) {
  const { addItem } = useCart()
  const toast = useToast()
  const addRef = useRef(null)
  const colorRef = useRef(null)
  const wasChoosing = useRef(false)
  const variants = product.variants ?? []
  const colors = colorsWithStock(variants)
  const [isChoosing, setIsChoosing] = useState(false)
  const [color, setColor] = useState(colors[0] ?? '')
  const [size, setSize] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const sizes = variants
    .filter((v) => v.available && v.attributes.color === color)
    .map((v) => v.attributes.size)
  // Una sola talla (p. ej. "Única"): no hace falta elegirla.
  const selectedSize = sizes.length === 1 ? sizes[0] : size
  const variant = variants.find(
    (v) => v.attributes.color === color && v.attributes.size === selectedSize,
  )
  const canAdd = product.inStock && colors.length > 0

  // El botón "Agregar" se reemplaza por las opciones: el foco va al primer campo y,
  // al cerrar, vuelve al botón (teclado y lectores de pantalla no pierden el lugar).
  useEffect(() => {
    if (isChoosing) colorRef.current?.focus()
    else if (wasChoosing.current) addRef.current?.focus()
    wasChoosing.current = isChoosing
  }, [isChoosing])

  async function handleAdd() {
    setIsAdding(true)
    try {
      await addItem(variant.id, 1)
      toast.show({
        tone: 'success',
        title: 'Agregado al carrito',
        description: `${product.name} · ${color} / ${selectedSize}`,
        action: { label: 'Ver carrito', to: paths.cart },
      })
      setIsChoosing(false)
    } catch (error) {
      toast.show({
        tone: 'danger',
        title: 'No pudimos agregarlo al carrito',
        description: error.userMessage ?? error.message,
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="chat-product">
      <Link className="chat-product__link" to={paths.product(product.slug)}>
        <ResponsiveImage src={product.image.url} alt="" className="chat-product__image" />
        <span className="chat-product__info">
          <span className="chat-product__name">{product.name}</span>
          <span className="chat-product__price">
            <Price amount={product.pricing.unitPrice} size="sm" />
            {product.pricing.compareAtPrice && (
              <Price
                amount={product.pricing.compareAtPrice}
                size="sm"
                tone="muted"
                strike
                srLabel="Antes"
              />
            )}
          </span>
          {!product.inStock && <span className="chat-product__stock">Agotado</span>}
        </span>
      </Link>

      {canAdd && !isChoosing && (
        <Button
          variant="secondary"
          size="sm"
          iconStart="bag"
          ref={addRef}
          className="chat-product__add"
          onClick={() => setIsChoosing(true)}
        >
          Agregar <span className="chat-product__sr">{product.name}</span>
        </Button>
      )}

      {canAdd && isChoosing && (
        <div className="chat-product__options">
          <SelectField
            ref={colorRef}
            label="Color"
            value={color}
            options={colors.map((value) => ({ value, label: value }))}
            onChange={(event) => {
              setColor(event.target.value)
              setSize('')
            }}
          />
          {sizes.length > 1 && (
            <SelectField
              label="Talla"
              value={size}
              placeholder="Elige"
              options={sizes.map((value) => ({ value, label: value }))}
              onChange={(event) => setSize(event.target.value)}
            />
          )}
          <div className="chat-product__actions">
            <Button size="sm" loading={isAdding} disabled={!variant} onClick={handleAdd}>
              Agregar al carrito
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsChoosing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
