import { Badge, Button } from '@/components/ui'
import { formatAddress } from '../../utils/addressValidation'
import './address-card.scss'

export function AddressCard({ address, onEdit, onDelete, onMakeDefault, isBusy = false }) {
  return (
    <article className="address-card" aria-busy={isBusy || undefined}>
      <header className="address-card__header">
        <h3 className="address-card__label">{address.label}</h3>
        {address.isDefault && <Badge tone="info">Predeterminada</Badge>}
      </header>
      <p className="address-card__recipient">
        {address.recipient} · {address.phone}
      </p>
      <p className="address-card__address">{formatAddress(address)}</p>
      {address.notes && <p className="address-card__notes">{address.notes}</p>}

      <div className="address-card__actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          aria-label={`Editar ${address.label}`}
        >
          Editar
        </Button>
        {!address.isDefault && (
          <Button variant="ghost" size="sm" onClick={onMakeDefault} disabled={isBusy}>
            Hacer predeterminada
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={`Eliminar ${address.label}`}
          className="address-card__delete"
        >
          Eliminar
        </Button>
      </div>
    </article>
  )
}
