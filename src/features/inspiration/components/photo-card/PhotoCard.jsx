import clsx from 'clsx'
import { ResponsiveImage } from '@/components/ui'
import { UNSPLASH_URL } from '@/utils/UnsplashApi'
import './photo-card.scss'

/**
 * Foto de Unsplash con el crédito "Foto de X en Unsplash" (lo exigen sus directrices).
 * `badge` va arriba a la izquierda (p. ej. la palabra clave) y `action` arriba
 * a la derecha (guardar o borrar).
 */
export function PhotoCard({ photo, linkRef, badge, action, className }) {
  return (
    <figure className={clsx('photo-card', className)} style={{ '--photo-color': photo.color }}>
      {badge && <span className="photo-card__badge">{badge}</span>}
      {action && <span className="photo-card__action">{action}</span>}
      <a
        ref={linkRef}
        className="photo-card__link"
        href={photo.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ResponsiveImage
          src={photo.src}
          alt={photo.alt}
          ratio="2 / 3"
          className="photo-card__image"
        />
        <span className="photo-card__hint"> (abre Unsplash en otra pestaña)</span>
      </a>
      <figcaption className="photo-card__caption">
        Foto de{' '}
        <a
          className="photo-card__author"
          href={photo.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {photo.photographer}
        </a>{' '}
        en{' '}
        <a
          className="photo-card__author"
          href={UNSPLASH_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </figcaption>
    </figure>
  )
}
