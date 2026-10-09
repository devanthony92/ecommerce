import { useRef, useState } from 'react'
import { EmptyState, useToast } from '@/components/feedback'
import { ContentCard, PageHeader } from '@/components/layout'
import { Button, IconButton, QuantityStepper, ResponsiveImage, TextField } from '@/components/ui'
import { useCart, variantLabel } from '@/features/cart'
import { useVariantLookup } from '@/features/catalog'
import { PANELS, useUi } from '@/hooks/useUi'
import { formatMoney } from '@/utils/formatMoney'
import './quick-order-page.scss'

/**
 * Pedido rápido: buscar referencias por nombre o SKU, armar una lista con
 * cantidades y agregarla completa al carrito. El precio final (con la escala
 * por cantidad) lo calcula el carrito.
 */
export default function QuickOrderPage() {
  const toast = useToast()
  const { addItems } = useCart()
  const { open } = useUi()
  const [text, setText] = useState('')
  const [lines, setLines] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const lookup = useVariantLookup(text)
  const listRef = useRef(null)

  const inList = (variantId) => lines.some((line) => line.variantId === variantId)
  const units = lines.reduce((sum, line) => sum + line.quantity, 0)

  function addLine(result) {
    setLines((current) => [
      ...current,
      {
        variantId: result.variantId,
        name: result.productName,
        attributes: result.attributes,
        sku: result.sku,
        image: result.image,
        stock: result.stock,
        quantity: Math.min(6, result.stock),
      },
    ])
  }

  const updateLine = (variantId, quantity) =>
    setLines((current) =>
      current.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)),
    )

  const removeLine = (variantId) =>
    setLines((current) => current.filter((line) => line.variantId !== variantId))

  async function handleAddAll() {
    setIsAdding(true)
    try {
      await addItems(lines.map(({ variantId, quantity }) => ({ variantId, quantity })))
      toast.show({
        tone: 'success',
        title: `Agregamos ${lines.length} ${lines.length === 1 ? 'referencia' : 'referencias'} al carrito`,
        description: `${units} unidades en total.`,
      })
      setLines([])
      open(PANELS.CART)
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos agregarlas', description: error.message })
    } finally {
      setIsAdding(false)
    }
  }

  const results = lookup.q.length >= 2 ? (lookup.data ?? []) : []

  return (
    <div className="quick-order">
      <PageHeader
        title="Pedido rápido"
        description="Busca por nombre o referencia y arma tu pedido sin recorrer el catálogo."
      />

      <div className="quick-order__layout">
        <ContentCard title="Buscar referencias">
          <TextField
            label="Nombre o referencia (SKU)"
            type="search"
            placeholder="Ej: camiseta, CAMISETA-NEG"
            value={text}
            onChange={(event) => setText(event.target.value)}
            hint="Escribe al menos 2 letras."
          />
          <ul
            className="quick-order__results"
            role="list"
            aria-label="Resultados"
            aria-busy={lookup.isTyping || lookup.isFetching || undefined}
          >
            {results.map((result) => (
              <li key={result.variantId} className="quick-order__result">
                <ResponsiveImage src={result.image.url} alt="" className="quick-order__image" />
                <span className="quick-order__info">
                  <span className="quick-order__name">{result.productName}</span>
                  <span className="quick-order__meta">
                    {variantLabel(result.attributes)} · {result.sku}
                  </span>
                  <span className="quick-order__meta">
                    {result.available
                      ? `${formatMoney(result.pricing.unitPrice)} c/u · ${result.stock} disponibles`
                      : 'Agotado'}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!result.available || inList(result.variantId)}
                  onClick={() => addLine(result)}
                  aria-label={`Agregar ${result.productName} ${variantLabel(result.attributes)}`}
                >
                  {inList(result.variantId) ? 'En la lista' : 'Agregar'}
                </Button>
              </li>
            ))}
          </ul>
          {lookup.q.length >= 2 && !lookup.isFetching && results.length === 0 && (
            <p className="quick-order__empty">No encontramos referencias con “{lookup.q}”.</p>
          )}
        </ContentCard>

        <div ref={listRef} className="quick-order__list-card" tabIndex={-1}>
          <ContentCard title={`Tu lista (${lines.length})`}>
            {lines.length === 0 ? (
              <EmptyState
                compact
                icon="bag"
                title="Tu lista está vacía"
                description="Agrega referencias desde la búsqueda."
              />
            ) : (
              <>
                <ul className="quick-order__lines" role="list" aria-label="Referencias del pedido">
                  {lines.map((line) => (
                    <li key={line.variantId} className="quick-order__line">
                      <span className="quick-order__info">
                        <span className="quick-order__name">{line.name}</span>
                        <span className="quick-order__meta">
                          {variantLabel(line.attributes)} · {line.sku}
                        </span>
                      </span>
                      <QuantityStepper
                        size="sm"
                        value={line.quantity}
                        onChange={(quantity) => updateLine(line.variantId, quantity)}
                        max={line.stock}
                        label={`Cantidad de ${line.name} ${variantLabel(line.attributes)}`}
                      />
                      <IconButton
                        icon="close"
                        size="sm"
                        label={`Quitar ${line.name} ${variantLabel(line.attributes)}`}
                        onClick={() => removeLine(line.variantId)}
                      />
                    </li>
                  ))}
                </ul>
                <p className="quick-order__total">{units} unidades en total</p>
                <Button block loading={isAdding} onClick={handleAddAll}>
                  Agregar todo al carrito
                </Button>
              </>
            )}
          </ContentCard>
        </div>
      </div>

      {/* Móvil: la lista queda debajo de los resultados; esta barra la mantiene a mano. */}
      {lines.length > 0 && (
        <div className="quick-order__mobile-bar">
          <span className="quick-order__mobile-summary">
            {lines.length} {lines.length === 1 ? 'referencia' : 'referencias'} · {units} u.
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              listRef.current?.focus({ preventScroll: true })
            }}
          >
            Ver lista
          </Button>
          <Button size="sm" loading={isAdding} onClick={handleAddAll}>
            Agregar todo
          </Button>
        </div>
      )}
    </div>
  )
}
