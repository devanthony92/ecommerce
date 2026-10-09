import { useId, useState } from 'react'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { Modal } from '@/components/modal'
import { Badge, Button, ChoiceCard } from '@/components/ui'
import { AddressForm, formatAddress, useAddresses, useCreateAddress } from '@/features/users'
import './address-step.scss'

// Elegir dirección. Sin direcciones guardadas, el formulario aparece directamente.
export function AddressStep({ selectedId, onSelect, onContinue }) {
  const name = useId()
  const query = useAddresses()
  const createAddress = useCreateAddress()
  const [isFormOpen, setIsFormOpen] = useState(false)

  async function handleCreate(values) {
    const address = await createAddress.mutateAsync(values)
    onSelect(address.id)
    setIsFormOpen(false)
    return address
  }

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" height="6rem" />}
      isEmpty={(addresses) => addresses.length === 0}
      empty={
        <div className="address-step">
          <p className="address-step__intro">
            Agrega la dirección donde quieres recibir tu pedido.
          </p>
          <AddressForm
            onSubmit={async (values) => {
              await handleCreate(values)
              onContinue()
            }}
            submitLabel="Guardar y continuar"
          />
        </div>
      }
      errorTitle="No pudimos cargar tus direcciones"
    >
      {(addresses) => (
        <div className="address-step">
          <fieldset className="address-step__options">
            <legend className="address-step__legend">Dirección de entrega</legend>
            {addresses.map((address) => (
              <ChoiceCard
                key={address.id}
                name={name}
                value={address.id}
                checked={selectedId === address.id}
                onChange={onSelect}
                title={
                  <>
                    {address.label} · {address.recipient}{' '}
                    {address.isDefault && <Badge>Predeterminada</Badge>}
                  </>
                }
                description={formatAddress(address)}
              />
            ))}
          </fieldset>

          <div className="address-step__actions">
            <Button variant="secondary" iconStart="plus" onClick={() => setIsFormOpen(true)}>
              Agregar otra dirección
            </Button>
            <Button disabled={!selectedId} onClick={onContinue}>
              Continuar
            </Button>
          </div>

          <Modal
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            title="Nueva dirección"
            size="lg"
          >
            <AddressForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </Modal>
        </div>
      )}
    </QueryBoundary>
  )
}
