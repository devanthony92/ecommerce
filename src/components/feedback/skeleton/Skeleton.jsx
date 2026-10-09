import clsx from 'clsx'
import './skeleton.scss'

/**
 * Bloque de carga. Es decorativo: el contenedor que lo usa debe anunciar
 * la carga (p. ej. `aria-busy` en la lista).
 * variant: text | rect | circle
 */
export function Skeleton({ variant = 'text', width, height, lines = 1, className }) {
  if (variant === 'text' && lines > 1) {
    return (
      <span className={clsx('skeleton', 'skeleton--lines', className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className="skeleton__line"
            // La última línea más corta, como un párrafo real.
            style={{ inlineSize: index === lines - 1 ? '60%' : width }}
          />
        ))}
      </span>
    )
  }

  return (
    <span
      className={clsx('skeleton', `skeleton--${variant}`, className)}
      style={{ inlineSize: width, blockSize: height }}
      aria-hidden="true"
    />
  )
}
