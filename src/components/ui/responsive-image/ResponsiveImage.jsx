import { useState } from 'react'
import clsx from 'clsx'
import { Icon } from '../icon/Icon'
import './responsive-image.scss'

/**
 * Imagen con espacio reservado (`ratio`) para evitar saltos de layout,
 * carga diferida por defecto y placeholder si falla.
 * Usar `priority` solo para la imagen principal visible al cargar (LCP).
 */
export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  alt,
  ratio = '4 / 5',
  fit = 'cover',
  priority = false,
  className,
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={clsx('responsive-image', `responsive-image--${fit}`, className)}
      style={{ aspectRatio: ratio }}
    >
      {failed || !src ? (
        <div className="responsive-image__fallback" role="img" aria-label={alt}>
          <Icon name="bag" size="xl" />
        </div>
      ) : (
        <img
          className="responsive-image__img"
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
