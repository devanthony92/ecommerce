import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import { useToast } from '@/components/feedback'
import { IconButton, Price, QuantityStepper, ResponsiveImage, SelectField } from '@/components/ui'
import { paths } from '@/constants/paths'
import { useCart } from '../../hooks/useCart'
import { variantLabel } from '../../utils'
import './cart-item.scss'

/**
 * Línea del carrito. `compact` para el drawer (sin cambio de variante).
 * La cantidad se envía al backend cuando el usuario deja de tocar el control.
 */
export function CartItem({ item, compact = false }) {
  const { updateItem, removeItem, isUpdating } = useCart()
  const toast = useToast()
  const [draft, setDraft] = useState(null)
  const [isScheduled, setIsScheduled] = useState(false)
  const commitTimer = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmedQuantity, setConfirmedQuantity] = useState(item.quantity)

  // Cuando el backend confirma otra cantidad, el borrador ya no hace falta (derivado en render).
  if (confirmedQuantity !== item.quantity) {
    setConfirmedQuantity(item.quantity)
    setDraft(null)
  }

  // Se muestra lo que eligió el usuario hasta que llegue la respuesta del backend:
  // así no "salta" al valor anterior mientras se recalcula el carrito.
  const quantity = draft !== null && (isScheduled || isUpdating) ? draft : item.quantity

  async function run(action, errorTitle) {
    setIsSaving(true)
    try {
      await action()
    } catch (error) {
      toast.show({ tone: 'danger', title: errorTitle, description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  // Cada clic actualiza el número al instante; al backend va solo el valor final.
  function handleQuantityChange(next) {
    setDraft(next)
    setIsScheduled(true)
    clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(async () => {
      await run(() => updateItem(item.id, { quantity: next }), 'No pudimos cambiar la cantidad')
      setIsScheduled(false)
    }, 400)
  }

  useEffect(() => () => clearTimeout(commitTimer.current), [])

  const hasDiscount = item.pricing.unitPrice < item.pricing.listPrice
  const variantOptions = item.variantOptions.map((option) => ({
    value: option.id,
    label: option.available
      ? variantLabel(option.attributes)
      : `${variantLabel(option.attributes)} (agotado)`,
    disabled: !option.available && option.id !== item.variant.id,
  }))

  return (
    <article
      className={clsx(
        'cart-item',
        compact && 'cart-item--compact',
        !item.available && 'cart-item--unavailable',
        isSaving && 'cart-item--saving',
      )}
      aria-busy={isSaving || undefined}
    >
      <ResponsiveImage src={item.image.url} alt={item.image.alt} className="cart-item__image" />

      <div className="cart-item__body">
        <h3 className="cart-item__name">
          <Link className="cart-item__link" to={paths.product(item.productSlug)}>
            {item.name}
          </Link>
        </h3>

        {compact || !item.available ? (
          <p className="cart-item__variant">{variantLabel(item.variant.attributes)}</p>
        ) : (
          <SelectField
            label="Talla y color"
            options={variantOptions}
            value={item.variant.id}
            onChange={(event) =>
              run(
                () => updateItem(item.id, { variantId: event.target.value }),
                'No pudimos cambiar la variante',
              )
            }
            className="cart-item__variant-select"
          />
        )}

        {item.available && (
          <p className="cart-item__unit">
            <Price
              amount={item.pricing.unitPrice}
              size="sm"
              tone={item.pricing.audience === 'WHOLESALE' ? 'wholesale' : 'default'}
              srLabel="Precio por unidad"
            />
            {hasDiscount && (
              <Price amount={item.pricing.listPrice} size="sm" strike srLabel="Precio público" />
            )}
            <span className="cart-item__unit-label">c/u</span>
          </p>
        )}

        {!item.available && <p className="cart-item__alert">Agotado: no se incluye en el total.</p>}
      </div>

      <div className="cart-item__actions">
        {item.available && (
          <QuantityStepper
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={item.variant.stock}
            size="sm"
            label={`Cantidad de ${item.name}`}
          />
        )}
        {item.available && (
          <Price
            amount={item.pricing.lineTotal}
            className="cart-item__total"
            srLabel="Total de la línea"
          />
        )}
        <IconButton
          icon="close"
          size="sm"
          label={`Quitar ${item.name} del carrito`}
          className="cart-item__remove"
          onClick={() => run(() => removeItem(item.id), 'No pudimos quitar el producto')}
        />
      </div>
    </article>
  )
}
