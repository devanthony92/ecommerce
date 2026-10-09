import { useId } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { IconButton } from '@/components/ui'
import { useOverlay } from '@/hooks/useOverlay'
import { usePresence } from '@/hooks/usePresence'
import './drawer.scss'

/**
 * Panel lateral reutilizable (carrito, filtros, menú móvil, resumen).
 * Sin lógica de negocio: el contenido lo pone cada feature.
 *
 * position: left | right | bottom
 * size: sm | md | lg
 */
export function Drawer({
  open,
  onClose,
  title,
  position = 'right',
  size = 'md',
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  id,
  className,
  children,
}) {
  const titleId = useId()
  const { isMounted, isVisible } = usePresence(open)
  const { containerRef } = useOverlay({ open, onClose, closeOnEsc, initialFocusRef })

  if (!isMounted) return null

  return createPortal(
    <div
      className={clsx(
        'drawer',
        `drawer--${position}`,
        `drawer--${size}`,
        isVisible && 'drawer--open',
        className,
      )}
    >
      <div
        className="drawer__backdrop"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={containerRef}
        id={id}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="drawer__header">
          <h2 className="drawer__title" id={titleId}>
            {title}
          </h2>
          <IconButton icon="close" label="Cerrar" onClick={onClose} />
        </header>
        <div className="drawer__body">{children}</div>
        {footer && <footer className="drawer__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
