import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { CatalogView } from '../components/catalog-view/CatalogView'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return (
      <>
        <PageHeader title="Buscar" />
        <EmptyState
          icon="search"
          title="¿Qué estás buscando?"
          description="Escribe el nombre de una prenda o categoría en el buscador."
        />
      </>
    )
  }

  return <CatalogView title={`Resultados para “${q}”`} />
}
