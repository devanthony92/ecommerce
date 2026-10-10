import { useRef, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { searchPhotos } from '@/utils/PexelsApi'

export const PAGE_SIZE = 3

// Última búsqueda guardada: { query, photos }. Al volver a la pestaña se restaura.
function restore() {
  const saved = storage.get(STORAGE_KEYS.inspiration)
  return Array.isArray(saved?.photos) ? saved : null
}

/**
 * Estado de la búsqueda de inspiración.
 * status: 'idle' (sin buscar) | 'loading' | 'success' | 'error'
 */
export function useInspirationSearch() {
  const [saved] = useState(restore)
  const [query, setQuery] = useState(saved?.query ?? '')
  const [photos, setPhotos] = useState(saved?.photos ?? [])
  const [status, setStatus] = useState(saved ? 'success' : 'idle')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // Solo la última búsqueda puede actualizar el estado (evita respuestas cruzadas).
  const lastRequest = useRef(0)

  async function search(keyword) {
    const requestId = ++lastRequest.current
    setQuery(keyword)
    setStatus('loading')
    setVisibleCount(PAGE_SIZE)
    try {
      const result = await searchPhotos(keyword)
      if (requestId !== lastRequest.current) return
      setPhotos(result)
      setStatus('success')
      storage.set(STORAGE_KEYS.inspiration, { query: keyword, photos: result })
    } catch {
      if (requestId !== lastRequest.current) return
      setPhotos([])
      setStatus('error')
    }
  }

  const showMore = () => setVisibleCount((count) => count + PAGE_SIZE)

  return {
    query,
    status,
    photos: photos.slice(0, visibleCount),
    total: photos.length,
    hasMore: visibleCount < photos.length,
    search,
    showMore,
  }
}
