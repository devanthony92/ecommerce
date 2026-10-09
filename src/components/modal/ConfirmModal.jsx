import { useRef } from 'react'
import { Button } from '@/components/ui'
import { Modal } from './Modal'

/**
 * Confirmación de una acción (eliminar, cancelar). Sin lógica de negocio.
 * El foco inicial va a "Cancelar": una acción destructiva nunca es la opción por defecto.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  isLoading = false,
  children,
}) {
  const cancelRef = useRef(null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button ref={cancelRef} variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p>{description}</p>}
      {children}
    </Modal>
  )
}
