import clsx from 'clsx'
import { ResponsiveImage } from '@/components/ui'
import './photo-card.scss'

// Foto de Pexels con el crédito del autor (lo exigen sus términos de uso).
export function PhotoCard({ photo, linkRef, className }) {
  return (
    <figure className={clsx('photo-card', className)} style={{ '--photo-color': photo.color }}>
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
        <span className="photo-card__hint"> (abre Pexels en otra pestaña)</span>
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
        </a>
      </figcaption>
    </figure>
  )
}
