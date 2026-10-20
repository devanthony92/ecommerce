import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui'
import { PhotoCard } from '../photo-card/PhotoCard'
import './photo-list.scss'

/**
 * Fotos en filas de tres (menos columnas en pantallas chicas). "Mostrar más"
 * agrega las siguientes y desaparece cuando ya se ven todas.
 */
export function PhotoList({ photos, hasMore, onShowMore, renderBadge, renderAction, className }) {
  const links = useRef([])
  const focusIndex = useRef(null)

  // Tras "Mostrar más", el foco pasa a la primera foto nueva (teclado y lector de pantalla).
  useEffect(() => {
    if (focusIndex.current === null) return
    links.current[focusIndex.current]?.focus()
    focusIndex.current = null
  }, [photos.length])

  return (
    <div className={clsx('photo-list', className)}>
      <ul className="photo-list__grid" role="list">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <PhotoCard
              photo={photo}
              badge={renderBadge?.(photo)}
              action={renderAction?.(photo)}
              linkRef={(element) => {
                links.current[index] = element
              }}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button
          variant="secondary"
          className="photo-list__more"
          onClick={() => {
            focusIndex.current = photos.length
            onShowMore()
          }}
        >
          Mostrar más
        </Button>
      )}
    </div>
  )
}
