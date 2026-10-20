import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button, Icon } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import { PhotoList } from '../components/photo-list/PhotoList'
import { PAGE_SIZE } from '../hooks/useInspirationSearch'
import { useDeleteInspiration, useSavedInspirations } from '../hooks/useSavedInspirations'
import { keywordsSummary } from '../utils/keywordsSummary'
import './saved-inspirations-page.scss'

// Inspiración guardada → misma forma que una foto de la búsqueda.
const toPhoto = (inspiration) => ({
  id: inspiration.id,
  keyword: inspiration.keyword,
  alt: inspiration.alt,
  url: inspiration.link,
  src: inspiration.image,
  photographer: inspiration.photographer,
  photographerUrl: inspiration.photographerUrl,
})

function countLabel(count) {
  return `${count} ${count === 1 ? 'inspiración guardada' : 'inspiraciones guardadas'}`
}

function SavedList({ inspirations }) {
  const toast = useToast()
  const remove = useDeleteInspiration()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const photos = inspirations.map(toPhoto)

  function handleDelete(photo) {
    remove.mutate(photo.id, {
      onSuccess: () => toast.show({ title: 'Inspiración eliminada' }),
      onError: (error) =>
        toast.show({ tone: 'danger', title: 'No pudimos eliminarla', description: error.message }),
    })
  }

  return (
    <PhotoList
      photos={photos.slice(0, visibleCount)}
      hasMore={visibleCount < photos.length}
      onShowMore={() => setVisibleCount((count) => count + PAGE_SIZE)}
      renderBadge={(photo) => photo.keyword}
      renderAction={(photo) => (
        <button
          type="button"
          className="saved-inspirations__delete"
          aria-label={`Eliminar ${photo.alt || 'la foto'} de mis inspiraciones`}
          disabled={remove.isPending}
          onClick={() => handleDelete(photo)}
        >
          <Icon name="trash" />
        </button>
      )}
    />
  )
}

/**
 * Inspiraciones guardadas del usuario (ruta protegida). Los datos vienen de
 * GET /inspirations de nuestro back-end.
 */
export default function SavedInspirationsPage() {
  const { currentUser } = useAuth()
  const query = useSavedInspirations()
  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="saved-inspirations">
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="16rem" />}
        errorTitle="No pudimos cargar tus inspiraciones"
      >
        {(inspirations) => (
          <>
            <PageHeader
              title="Inspiraciones guardadas"
              description={`${firstName}, tienes ${countLabel(inspirations.length)}.`}
            />
            {inspirations.length > 0 && (
              <p className="saved-inspirations__keywords">
                Por palabras clave: <strong>{keywordsSummary(inspirations)}</strong>
              </p>
            )}
            {inspirations.length === 0 ? (
              <EmptyState
                icon="search"
                title="Aún no guardas inspiraciones"
                description="Busca ideas de estilo y guarda las fotos que te gusten."
                action={
                  <Button as={Link} to={paths.inspiration}>
                    Buscar inspiración
                  </Button>
                }
              />
            ) : (
              <SavedList inspirations={inspirations} />
            )}
          </>
        )}
      </QueryBoundary>
    </div>
  )
}
