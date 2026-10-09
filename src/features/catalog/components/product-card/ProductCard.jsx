import { Link } from 'react-router'
import clsx from 'clsx'
import { Badge, ResponsiveImage } from '@/components/ui'
import { FavoriteButton } from '@/features/favorites'
import { PriceTag, TierStrip } from '@/features/pricing'
import { paths } from '@/constants/paths'
import { usePrefetchProduct } from '../../hooks/usePrefetchProduct'
import './product-card.scss'

const TAG_BADGES = {
  new: { label: 'Nuevo', tone: 'info' },
  bestseller: { label: 'Más vendido', tone: 'neutral' },
}

const MAX_SWATCHES = 4

// `showTiers`: muestra todas las escalas (catálogo mayorista).
// `headingLevel`: 2 si la grilla cuelga del h1 de la página, 3 si va bajo una sección.
export function ProductCard({ product, priority = false, showTiers = false, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`
  const prefetch = usePrefetchProduct()
  // Si la imagen es de otro color (catálogo filtrado), el detalle abre con ese color.
  const href =
    product.image.color && product.image.color !== product.colors[0]?.name
      ? `${paths.product(product.slug)}?color=${encodeURIComponent(product.image.color)}`
      : paths.product(product.slug)

  const badges = product.tags.filter((tag) => TAG_BADGES[tag]).slice(0, 1)
  const extraColors = product.colors.length - MAX_SWATCHES

  return (
    <article
      className={clsx(
        'product-card',
        !product.inStock && 'product-card--out-of-stock',
        product.pricing.audience === 'WHOLESALE' && 'product-card--wholesale',
      )}
    >
      <div className="product-card__media">
        <ResponsiveImage
          src={product.image.url}
          alt={product.image.alt}
          priority={priority}
          className="product-card__image"
        />
        <FavoriteButton product={product} className="product-card__favorite" />
        <div className="product-card__badges">
          {!product.inStock && <Badge tone="danger">Agotado</Badge>}
          {product.inStock &&
            badges.map((tag) => (
              <Badge key={tag} tone={TAG_BADGES[tag].tone}>
                {TAG_BADGES[tag].label}
              </Badge>
            ))}
        </div>
      </div>

      <div className="product-card__body">
        <p className="product-card__category">{product.category.name}</p>
        <Heading className="product-card__title">
          {/* El enlace cubre toda la tarjeta (::after), pero el nombre accesible es el título. */}
          <Link
            className="product-card__link"
            to={href}
            onMouseEnter={() => prefetch(product.slug)}
            onFocus={() => prefetch(product.slug)}
          >
            {product.name}
          </Link>
        </Heading>

        <p className="product-card__colors-label">
          Colores: {product.colors.map((color) => color.name).join(', ')}
        </p>
        <ul className="product-card__swatches" aria-hidden="true">
          {product.colors.slice(0, MAX_SWATCHES).map((color) => (
            <li
              key={color.name}
              className="product-card__swatch"
              style={{ backgroundColor: color.hex }}
            />
          ))}
          {extraColors > 0 && <li className="product-card__swatch-more">+{extraColors}</li>}
        </ul>

        <PriceTag
          pricing={product.pricing}
          showVolumeHint={!showTiers}
          className="product-card__price"
        />
        {showTiers && <TierStrip tiers={product.pricing.tiers} />}
      </div>
    </article>
  )
}
