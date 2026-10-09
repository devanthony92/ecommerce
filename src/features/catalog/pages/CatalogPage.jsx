import { Link, useParams } from 'react-router'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { paths } from '@/constants/paths'
import { CatalogView } from '../components/catalog-view/CatalogView'
import { useCategories } from '../hooks/useCategories'

export default function CatalogPage() {
  const { categorySlug } = useParams()
  const { data: categories } = useCategories()
  const category = categories?.find((item) => item.slug === categorySlug)

  if (categorySlug && categories && !category) {
    return (
      <EmptyState
        icon="search"
        title="Categoría no encontrada"
        description="Puede que haya cambiado de nombre."
        action={
          <Button as={Link} to={paths.catalog}>
            Ver todo el catálogo
          </Button>
        }
      />
    )
  }

  return (
    <CatalogView
      // key: al cambiar de categoría se reinicia el estado de la vista.
      key={categorySlug ?? 'all'}
      title={category?.name ?? 'Catálogo'}
      description={
        category ? undefined : 'Compra por unidad o, con cuenta mayorista, con precios por volumen.'
      }
      categorySlug={categorySlug}
    />
  )
}
