import clsx from 'clsx'
import { ResponsiveImage } from '@/components/ui'
import './product-gallery.scss'

// Una foto por color. Las miniaturas cambian el color seleccionado.
export function ProductGallery({ images, selectedColor, onColorChange, className }) {
  const current = images.find((image) => image.color === selectedColor) ?? images[0]

  return (
    <div className={clsx('product-gallery', className)}>
      <ResponsiveImage
        key={current.url}
        src={current.url}
        alt={current.alt}
        priority
        className="product-gallery__main"
      />

      {images.length > 1 && (
        <ul className="product-gallery__thumbs" role="list">
          {images.map((image) => (
            <li key={image.url}>
              <button
                type="button"
                className={clsx(
                  'product-gallery__thumb',
                  image.color === current.color && 'product-gallery__thumb--active',
                )}
                aria-label={`Ver color ${image.color}`}
                aria-pressed={image.color === current.color}
                onClick={() => onColorChange(image.color)}
              >
                <ResponsiveImage src={image.url} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
