import { useState } from 'react'
import { useToast } from '@/components/feedback'
import { ConfirmModal } from '@/components/modal'
import { SelectField, TextField } from '@/components/ui'
import { useCancelOrder } from '../../hooks/useOrderActions'
import './cancel-order-modal.scss'

const REASONS = [
  { value: 'Me equivoqué en el pedido', label: 'Me equivoqué en el pedido' },
  { value: 'Ya no lo necesito', label: 'Ya no lo necesito' },
  { value: 'Encontré mejor precio', label: 'Encontré mejor precio' },
  { value: 'Otro', label: 'Otro motivo' },
]

export function CancelOrderModal({ order, open, onClose }) {
  const toast = useToast()
  const cancelOrder = useCancelOrder()
  const [reason, setReason] = useState(REASONS[0].value)
  const [details, setDetails] = useState('')

  async function handleConfirm() {
    try {
      await cancelOrder.mutateAsync({
        id: order.id,
        reason: reason === 'Otro' ? details || 'Otro' : reason,
      })
      toast.show({ title: `Cancelaste el pedido ${order.number}` })
      onClose()
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos cancelarlo', description: error.message })
    }
  }

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`Cancelar pedido ${order.number}`}
      description="Si ya pagaste, el reembolso se hace al mismo medio de pago en 5 a 8 días hábiles."
      confirmLabel="Cancelar pedido"
      cancelLabel="Volver"
      isLoading={cancelOrder.isPending}
    >
      <div className="cancel-order-modal">
        <SelectField
          label="Motivo"
          options={REASONS}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        {reason === 'Otro' && (
          <TextField
            label="Cuéntanos más (opcional)"
            multiline
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        )}
      </div>
    </ConfirmModal>
  )
}
