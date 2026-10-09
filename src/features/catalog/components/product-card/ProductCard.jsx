import { Link } from 'react-router'
import clsx from 'clsx'
import { Badge, ResponsiveImage } from '@/components/ui'
import { PriceTag } from '@/features/pricing'
import { paths } from '@/constants/paths'
import './product-card.scss'

const TAG_BADGES = {
  new: { label: 'Nuevo', tone: 'info' },
  bestseller: { label: 'Más vendido', tone: 'neutral' },
}

const MAX_SWATCHES = 4

export function ProductCard({ product, priority = false }) {
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
        <h3 className="product-card__title">
          {/* El enlace cubre toda la tarjeta (::after), pero el nombre accesible es el título. */}
          <Link className="product-card__link" to={paths.product(product.slug)}>
            {product.name}
          </Link>
        </h3>

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

        <PriceTag pricing={product.pricing} className="product-card__price" />
      </div>
    </article>
  )
}
