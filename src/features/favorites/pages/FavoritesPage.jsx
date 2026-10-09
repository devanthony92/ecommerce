import { Link } from 'react-router'
import { EmptyState, QueryBoundary } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui'
import { ProductGrid, ProductGridSkeleton } from '@/features/catalog'
import { paths } from '@/constants/paths'
import { useFavorites } from '../hooks/useFavorites'

export default function FavoritesPage() {
  const query = useFavorites()

  return (
    <>
      <PageHeader
        title="Favoritos"
        description="Productos guardados con tu precio actual. Toca el corazón para quitarlos."
      />
      <QueryBoundary
        query={query}
        loading={<ProductGridSkeleton count={4} />}
        isEmpty={(items) => items.length === 0}
        empty={
          <EmptyState
            icon="heart"
            title="Aún no tienes favoritos"
            description="Toca el corazón en cualquier producto para guardarlo aquí."
            action={
              <Button as={Link} to={paths.catalog} variant="secondary">
                Ver catálogo
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tus favoritos"
      >
        {(items) => <ProductGrid products={items} headingLevel={2} />}
      </QueryBoundary>
    </>
  )
}
