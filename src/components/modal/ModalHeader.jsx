import { IconButton } from '@/components/ui'

export function ModalHeader({ titleId, onClose, children }) {
  return (
    <header className="modal__header">
      <h2 className="modal__title" id={titleId}>
        {children}
      </h2>
      {onClose && (
        <IconButton icon="close" label="Cerrar" className="modal__close" onClick={onClose} />
      )}
    </header>
  )
}
