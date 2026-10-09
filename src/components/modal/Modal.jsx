import { useId } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useOverlay } from '@/hooks/useOverlay'
import { usePresence } from '@/hooks/usePresence'
import { ModalBody } from './ModalBody'
import { ModalFooter } from './ModalFooter'
import { ModalHeader } from './ModalHeader'
import './modal.scss'

/**
 * Modal base sin lógica de negocio. Los features crean sus modales encima:
 *
 * <Modal open={open} onClose={close} title="Cancelar pedido" footer={<Button>…</Button>}>
 *   …contenido…
 * </Modal>
 *
 * Sin `title` hay que pasar `ariaLabel`.
 * size: sm | md | lg | fullscreen
 */
export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  size = 'md',
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
  children,
}) {
  const titleId = useId()
  const { isMounted, isVisible } = usePresence(open)
  const { containerRef } = useOverlay({ open, onClose, closeOnEsc, initialFocusRef })

  if (!isMounted) return null

  return createPortal(
    <div className={clsx('modal', `modal--${size}`, isVisible && 'modal--open', className)}>
      <div
        className="modal__backdrop"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={containerRef}
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
      >
        {title && (
          <ModalHeader titleId={titleId} onClose={onClose}>
            {title}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>,
    document.body,
  )
}
