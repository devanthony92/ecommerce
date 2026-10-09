import { Link } from 'react-router'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { ResponsiveImage } from '@/components/ui'
import { useProducts } from '@/features/catalog'
import { TierStrip } from '@/features/pricing'
import { paths } from '@/constants/paths'
import './volume-offers.scss'

const PARAMS = { tag: 'volume-offer', pageSize: 3 }

/**
 * "Compra más, paga menos": productos con sus escalas reales del backend
 * (con el nivel del usuario aplicado si es mayorista).
 */
export function VolumeOffers() {
  const query = useProducts(PARAMS)

  return (
    <section className="volume-offers" aria-labelledby="volume-offers-title">
      <header className="volume-offers__header">
        <h2 className="volume-offers__title" id="volume-offers-title">
          Compra más, paga menos
        </h2>
        <p className="volume-offers__text">
          El precio baja desde media docena, sumando tallas y colores del mismo producto.
        </p>
      </header>
      <QueryBoundary query={query} loading={<Skeleton variant="rect" height="12rem" />}>
        {(data) => (
          <ul className="volume-offers__list" role="list">
            {data.items.map((product) => (
              <li key={product.id} className="volume-offers__item">
                <ResponsiveImage
                  src={product.image.url}
                  alt=""
                  ratio="1 / 1"
                  className="volume-offers__image"
                />
                <div className="volume-offers__body">
                  <Link className="volume-offers__name" to={paths.product(product.slug)}>
                    {product.name}
                  </Link>
                  <TierStrip tiers={product.pricing.tiers} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </section>
  )
}
