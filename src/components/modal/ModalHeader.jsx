import { IconButton } from '@/components/ui'

// div y no header: el modal va en un portal y un header ahí sería un segundo banner.
export function ModalHeader({ titleId, onClose, children }) {
  return (
    <div className="modal__header">
      <h2 className="modal__title" id={titleId}>
        {children}
      </h2>
      {onClose && (
        <IconButton icon="close" label="Cerrar" className="modal__close" onClick={onClose} />
      )}
    </div>
  )
}
