import { Link } from 'react-router'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { ResponsiveImage } from '@/components/ui'
import { useCategories } from '@/features/catalog'
import { paths } from '@/constants/paths'
import './category-tiles.scss'

export function CategoryTiles() {
  const query = useCategories()

  return (
    <QueryBoundary query={query} loading={<Skeleton variant="rect" height="10rem" />}>
      {(categories) => (
        <ul className="category-tiles" role="list">
          {categories.map((category) => (
            <li key={category.id}>
              <Link className="category-tiles__link" to={paths.category(category.slug)}>
                <ResponsiveImage
                  src={category.image?.url}
                  alt=""
                  ratio="1 / 1"
                  className="category-tiles__image"
                />
                <span className="category-tiles__label">
                  <span className="category-tiles__name">{category.name}</span>
                  <span className="category-tiles__count">{category.productCount} productos</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </QueryBoundary>
  )
}
