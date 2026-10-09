import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useToast } from '@/components/feedback'
import { IconButton, Price, QuantityStepper, ResponsiveImage } from '@/components/ui'
import { variantLabel } from '@/features/cart'
import { paths } from '@/constants/paths'
import { useRemoveListItem, useUpdateListItem } from '../../hooks/useLists'
import './list-item-row.scss'

// Producto de una lista. La cantidad se guarda cuando el usuario deja de tocarla.
export function ListItemRow({ listId, item }) {
  const toast = useToast()
  const updateItem = useUpdateListItem()
  const removeItem = useRemoveListItem()
  const [draft, setDraft] = useState(null)
  const timer = useRef(null)
  const quantity = draft ?? item.quantity
  const label = `${item.name} ${variantLabel(item.variant.attributes)}`

  function handleQuantity(next) {
    setDraft(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        await updateItem.mutateAsync({ listId, itemId: item.id, quantity: next })
      } catch (error) {
        toast.show({
          tone: 'danger',
          title: 'No pudimos guardar la cantidad',
          description: error.message,
        })
      }
      setDraft(null)
    }, 400)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleRemove() {
    try {
      await removeItem.mutateAsync({ listId, itemId: item.id })
      toast.show({ title: `Quitamos ${item.name} de la lista` })
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos quitarlo', description: error.message })
    }
  }

  return (
    <article className="list-item-row">
      <ResponsiveImage src={item.image.url} alt="" className="list-item-row__image" />
      <div className="list-item-row__info">
        <Link className="list-item-row__name" to={paths.product(item.productSlug)}>
          {item.name}
        </Link>
        <span className="list-item-row__meta">
          {variantLabel(item.variant.attributes)} · {item.variant.sku}
        </span>
        {item.available ? (
          <span className="list-item-row__meta">
            <Price amount={item.pricing.unitPrice} size="sm" /> c/u por {item.quantity}
          </span>
        ) : (
          <span className="list-item-row__unavailable">Agotado por ahora</span>
        )}
      </div>
      <div className="list-item-row__controls">
        <QuantityStepper
          size="sm"
          value={quantity}
          onChange={handleQuantity}
          label={`Cantidad habitual de ${label}`}
        />
        <IconButton
          icon="close"
          size="sm"
          label={`Quitar ${label} de la lista`}
          onClick={handleRemove}
        />
      </div>
    </article>
  )
}
