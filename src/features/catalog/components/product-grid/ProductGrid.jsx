import clsx from 'clsx'
import { Skeleton } from '@/components/feedback'
import { ProductCard } from '../product-card/ProductCard'
import './product-grid.scss'

// Las primeras imágenes se cargan con prioridad (están en el primer pantallazo).
const PRIORITY_COUNT = 4

export function ProductGrid({ products, isUpdating = false, showTiers = false }) {
  return (
    <ul
      className={clsx('product-grid', isUpdating && 'product-grid--updating')}
      aria-busy={isUpdating || undefined}
    >
      {products.map((product, index) => (
        <li key={product.id} className="product-grid__item">
          <ProductCard product={product} priority={index < PRIORITY_COUNT} showTiers={showTiers} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <ul className="product-grid" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="product-grid__item product-grid__item--placeholder">
          <Skeleton variant="rect" height="auto" className="product-grid__image-placeholder" />
          <Skeleton width="40%" />
          <Skeleton lines={2} />
        </li>
      ))}
    </ul>
  )
}
