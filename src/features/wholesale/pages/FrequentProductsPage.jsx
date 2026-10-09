import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button, Checkbox, Price, QuantityStepper, ResponsiveImage } from '@/components/ui'
import { useCart, variantLabel } from '@/features/cart'
import { paths } from '@/constants/paths'
import { PANELS, useUi } from '@/hooks/useUi'
import { formatDate } from '@/utils/formatDate'
import { useFrequentProducts } from '../hooks/useWholesaleRequest'
import './frequent-products-page.scss'

/**
 * "Mis productos habituales": lo que más compra, con su cantidad habitual.
 * Por defecto todo lo disponible viene marcado; se agrega al carrito de una vez.
 */
function FrequentList({ items }) {
  const toast = useToast()
  const { addItems } = useCart()
  const { open } = useUi()
  // Solo se guardan los cambios del usuario; el resto usa los valores por defecto.
  const [changes, setChanges] = useState({})
  const [isAdding, setIsAdding] = useState(false)

  const stateOf = (item) => ({
    checked: item.variant.available,
    quantity: Math.min(item.usualQuantity, item.variant.stock || item.usualQuantity),
    ...changes[item.variant.id],
  })
  const update = (variantId, patch) =>
    setChanges((current) => ({ ...current, [variantId]: { ...current[variantId], ...patch } }))

  const selected = items.filter((item) => item.variant.available && stateOf(item).checked)

  async function handleAdd() {
    setIsAdding(true)
    try {
      await addItems(
        selected.map((item) => ({ variantId: item.variant.id, quantity: stateOf(item).quantity })),
      )
      toast.show({
        tone: 'success',
        title: `Agregamos ${selected.length} ${selected.length === 1 ? 'producto' : 'productos'} al carrito`,
      })
      open(PANELS.CART)
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos agregarlos', description: error.message })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="frequent-products">
      <ul className="frequent-products__list" role="list">
        {items.map((item) => {
          const state = stateOf(item)
          const label = `${item.product.name} · ${variantLabel(item.variant.attributes)}`
          return (
            <li key={item.variant.id} className="frequent-products__item">
              <ResponsiveImage
                src={item.product.image.url}
                alt=""
                className="frequent-products__image"
              />
              <div className="frequent-products__info">
                <Checkbox
                  label={label}
                  checked={state.checked && item.variant.available}
                  disabled={!item.variant.available}
                  onChange={(event) => update(item.variant.id, { checked: event.target.checked })}
                />
                <p className="frequent-products__meta">
                  {item.variant.available
                    ? `Sueles pedir ${item.usualQuantity} · ${item.timesOrdered} ${
                        item.timesOrdered === 1 ? 'pedido' : 'pedidos'
                      } · Último: ${formatDate(item.lastOrderedAt)}`
                    : 'Agotado por ahora'}
                </p>
              </div>
              {item.variant.available && (
                <div className="frequent-products__controls">
                  <QuantityStepper
                    size="sm"
                    value={state.quantity}
                    max={item.variant.stock}
                    onChange={(quantity) => update(item.variant.id, { quantity })}
                    label={`Cantidad de ${label}`}
                  />
                  <span className="frequent-products__price">
                    <Price amount={item.pricing.unitPrice} size="sm" tone="wholesale" /> c/u
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="frequent-products__footer">
        <Button size="lg" loading={isAdding} disabled={selected.length === 0} onClick={handleAdd}>
          Agregar al carrito ({selected.length})
        </Button>
      </div>
    </div>
  )
}

export default function FrequentProductsPage() {
  const query = useFrequentProducts()

  return (
    <>
      <PageHeader
        title="Mis productos habituales"
        description="Lo que más compras, con tu cantidad de siempre. Ajusta y agrega todo al carrito."
      />
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="14rem" />}
        isEmpty={(items) => items.length === 0}
        empty={
          <EmptyState
            icon="bag"
            title="Aún no hay productos habituales"
            description="Aparecerán aquí después de tus primeros pedidos."
            action={
              <Button as={Link} to={paths.wholesaleCatalog} variant="secondary">
                Ver catálogo mayorista
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tus productos"
      >
        {(items) => <FrequentList items={items} />}
      </QueryBoundary>
    </>
  )
}
