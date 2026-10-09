import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { EmptyState, ErrorState, Skeleton, useToast } from '@/components/feedback'
import { Breadcrumbs } from '@/components/layout'
import { Button, QuantityStepper } from '@/components/ui'
import { useRequireAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { FavoriteButton } from '@/features/favorites'
import { AddToListModal } from '@/features/lists'
import {
  PriceDisplay,
  PricingTiers,
  QuantityTierProgress,
  SavingsIndicator,
  usePriceQuote,
} from '@/features/pricing'
import { paths } from '@/constants/paths'
import { ProductGallery } from '../components/product-gallery/ProductGallery'
import { VariantSelector } from '../components/variant-selector/VariantSelector'
import { useProduct } from '../hooks/useProduct'
import { useVariantSelection } from '../hooks/useVariantSelection'
import './product-page.scss'

const LOW_STOCK = 10

function ProductDetail({ product, initialColor }) {
  const toast = useToast()
  const { addItem } = useCart()
  const selection = useVariantSelection(product, initialColor)
  const { variant } = selection
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isSavingToList, setIsSavingToList] = useState(false)
  const requireAuth = useRequireAuth()

  // El precio no depende de la talla: sin talla elegida se cotiza con cualquier variante.
  const { pricing, isUpdating } = usePriceQuote({
    variantId: variant?.id ?? product.variants[0].id,
    quantity,
    initialPricing: product.pricing,
  })

  const maxQuantity = variant?.available ? variant.stock : undefined
  const effectiveQuantity = maxQuantity ? Math.min(quantity, maxQuantity) : quantity
  const colorHexes = Object.fromEntries(product.colors.map((color) => [color.name, color.hex]))
  const canAdd = Boolean(variant?.available)

  async function handleAddToCart() {
    setIsAdding(true)
    try {
      await addItem(variant.id, effectiveQuantity)
      toast.show({
        tone: 'success',
        title: 'Agregado al carrito',
        description: `${product.name} · ${selection.color} / ${selection.size} × ${effectiveQuantity}`,
      })
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos agregarlo', description: error.message })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="product-page__layout">
      <ProductGallery
        images={product.images}
        selectedColor={selection.color}
        onColorChange={selection.setColor}
        className="product-page__gallery"
      />

      <div className="product-page__info">
        <div className="product-page__heading">
          <Link className="product-page__category" to={paths.category(product.category.slug)}>
            {product.category.name}
          </Link>
          <div className="product-page__title-row">
            <h1 className="product-page__title">{product.name}</h1>
            <FavoriteButton product={product} />
          </div>
        </div>

        <PriceDisplay pricing={pricing} isUpdating={isUpdating} />
        <SavingsIndicator pricing={pricing} />

        <VariantSelector selection={selection} colorHexes={colorHexes} />

        <div className="product-page__purchase">
          <QuantityStepper
            value={effectiveQuantity}
            onChange={setQuantity}
            min={1}
            max={maxQuantity}
          />
          <Button
            size="lg"
            iconStart="bag"
            disabled={!canAdd}
            loading={isAdding}
            onClick={handleAddToCart}
            className="product-page__add"
          >
            {selection.size ? 'Agregar al carrito' : 'Elige una talla'}
          </Button>
          <Button
            variant="ghost"
            iconStart="inbox"
            disabled={!variant}
            onClick={() => requireAuth(() => setIsSavingToList(true))}
            className="product-page__save"
          >
            Guardar en lista
          </Button>
        </div>
        {variant && (
          <AddToListModal
            open={isSavingToList}
            onClose={() => setIsSavingToList(false)}
            item={{
              variantId: variant.id,
              quantity: effectiveQuantity,
              label: `${product.name} · ${selection.color} / ${selection.size}`,
            }}
          />
        )}

        {variant && !variant.available && (
          <p className="product-page__stock product-page__stock--out">
            Esta combinación está agotada.
          </p>
        )}
        {variant?.available && variant.stock <= LOW_STOCK && (
          <p className="product-page__stock">Quedan solo {variant.stock} unidades.</p>
        )}

        <QuantityTierProgress pricing={pricing} />
        <PricingTiers tiers={pricing.tiers} onSelect={setQuantity} />

        <section className="product-page__description" aria-labelledby="product-description">
          <h2 className="product-page__subtitle" id="product-description">
            Descripción
          </h2>
          <p>{product.description}</p>
        </section>
      </div>
    </div>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="product-page__layout" aria-busy="true" aria-label="Cargando producto">
      <Skeleton variant="rect" className="product-page__gallery-placeholder" />
      <div className="product-page__info">
        <Skeleton width="30%" />
        <Skeleton width="70%" height="2rem" />
        <Skeleton width="40%" height="2.5rem" />
        <Skeleton lines={4} />
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const query = useProduct(slug)

  if (query.isError && query.error.status === 404) {
    return (
      <EmptyState
        icon="search"
        title="Producto no encontrado"
        description="Puede que ya no esté disponible."
        action={
          <Button as={Link} to={paths.catalog}>
            Ver el catálogo
          </Button>
        }
      />
    )
  }

  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        onRetry={() => query.refetch()}
        isRetrying={query.isFetching}
      />
    )
  }

  const product = query.data

  return (
    <div className="product-page">
      <Breadcrumbs
        items={[
          { to: paths.home, label: 'Inicio' },
          { to: paths.catalog, label: 'Catálogo' },
          ...(product
            ? [
                { to: paths.category(product.category.slug), label: product.category.name },
                { label: product.name },
              ]
            : []),
        ]}
      />
      {product ? (
        // key: al navegar a otro producto se reinicia la selección.
        <ProductDetail
          key={product.id}
          product={product}
          initialColor={searchParams.get('color')}
        />
      ) : (
        <ProductPageSkeleton />
      )}
    </div>
  )
}
