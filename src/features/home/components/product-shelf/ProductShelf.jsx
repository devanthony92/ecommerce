import { useId } from 'react'
import { Link } from 'react-router'
import { QueryBoundary } from '@/components/feedback'
import { ProductGrid, ProductGridSkeleton, useProducts } from '@/features/catalog'
import './product-shelf.scss'

// Vitrina de productos para la home. `params` va directo a GET /products.
export function ProductShelf({ title, description, params, action }) {
  const titleId = useId()
  const query = useProducts(params)

  return (
    <section className="product-shelf" aria-labelledby={titleId}>
      <header className="product-shelf__header">
        <div>
          <h2 className="product-shelf__title" id={titleId}>
            {title}
          </h2>
          {description && <p className="product-shelf__description">{description}</p>}
        </div>
        {action && (
          <Link className="product-shelf__action" to={action.to}>
            {action.label}
          </Link>
        )}
      </header>
      <QueryBoundary
        query={query}
        loading={<ProductGridSkeleton count={params.pageSize} />}
        isEmpty={(data) => data.items.length === 0}
        empty={null}
      >
        {(data) => <ProductGrid products={data.items} />}
      </QueryBoundary>
    </section>
  )
}
