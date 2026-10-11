import { useMemo } from 'react'
import { Link } from 'react-router'
import { EmptyState, LoadingState } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import { InspirationSearch } from '../components/inspiration-search/InspirationSearch'
import { PhotoList } from '../components/photo-list/PhotoList'
import { SavePhotoButton } from '../components/save-photo-button/SavePhotoButton'
import { useInspirationSearch } from '../hooks/useInspirationSearch'
import { useSavedInspirations } from '../hooks/useSavedInspirations'
import './inspiration-page.scss'

export const NOT_FOUND_MESSAGE = 'No se ha encontrado nada'
export const REQUEST_ERROR_MESSAGE =
  'Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexión o que el servidor no funcione. Por favor, inténtalo más tarde'

function Results({ status, photos, query, hasMore, onShowMore, renderAction }) {
  if (status === 'loading') return <LoadingState label="Buscando fotos…" />
  if (status === 'error') {
    return (
      <p className="inspiration-page__error" role="alert">
        {REQUEST_ERROR_MESSAGE}
      </p>
    )
  }
  if (photos.length === 0) {
    return (
      <EmptyState
        icon="search"
        title={NOT_FOUND_MESSAGE}
        description={`No hay fotos para “${query}”. Prueba con otra palabra.`}
      />
    )
  }
  return (
    <PhotoList
      photos={photos}
      hasMore={hasMore}
      onShowMore={onShowMore}
      renderAction={renderAction}
    />
  )
}

/**
 * Ideas de estilo con fotos de Pexels (API de terceros). La última búsqueda
 * se guarda en localStorage y se restaura al volver.
 */
export default function InspirationPage() {
  const { query, status, photos, hasMore, search, showMore } = useInspirationSearch()
  const { isAuthenticated } = useAuth()
  const { data: saved } = useSavedInspirations()
  // Foto de Pexels → inspiración guardada (para pintar el icono de guardado).
  const savedByPhoto = useMemo(
    () => new Map((saved ?? []).map((item) => [item.pexelsId, item])),
    [saved],
  )

  return (
    <div className="inspiration-page">
      <PageHeader
        title="Inspiración"
        description="Ideas para combinar tus prendas. Busca un estilo, una prenda o un color."
      />
      {isAuthenticated && (
        <Link className="inspiration-page__saved-link" to={paths.savedInspirations}>
          Ver mis inspiraciones guardadas{saved ? ` (${saved.length})` : ''}
        </Link>
      )}
      <InspirationSearch initialQuery={query} isLoading={status === 'loading'} onSearch={search} />

      {/* El bloque de resultados solo existe después de buscar. */}
      {status !== 'idle' && (
        <section
          className="inspiration-page__results"
          aria-labelledby="inspiration-results-title"
          aria-busy={status === 'loading' || undefined}
        >
          <h2 className="inspiration-page__subtitle" id="inspiration-results-title">
            Resultados{query && ` para “${query}”`}
          </h2>
          <Results
            status={status}
            photos={photos}
            query={query}
            hasMore={hasMore}
            onShowMore={showMore}
            renderAction={(photo) => (
              <SavePhotoButton
                photo={photo}
                keyword={query}
                saved={savedByPhoto.get(photo.id) ?? null}
              />
            )}
          />
        </section>
      )}

      <p className="inspiration-page__credit">
        Fotos de{' '}
        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">
          Pexels
        </a>
      </p>
    </div>
  )
}
