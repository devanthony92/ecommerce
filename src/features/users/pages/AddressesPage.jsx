import { useState } from 'react'
import { EmptyState, QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { ConfirmModal, Modal } from '@/components/modal'
import { Button } from '@/components/ui'
import { AddressCard } from '../components/address-card/AddressCard'
import { AddressForm } from '../components/address-form/AddressForm'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from '../hooks/useAddresses'
import './addresses-page.scss'

export default function AddressesPage() {
  const toast = useToast()
  const query = useAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  // editing: null (cerrado) | 'new' | dirección a editar
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  async function handleSave(values) {
    if (editing === 'new') {
      await createAddress.mutateAsync(values)
      toast.show({ tone: 'success', title: 'Dirección agregada' })
    } else {
      await updateAddress.mutateAsync({ id: editing.id, ...values })
      toast.show({ tone: 'success', title: 'Dirección actualizada' })
    }
    setEditing(null)
  }

  async function handleMakeDefault(address) {
    try {
      await updateAddress.mutateAsync({ id: address.id, isDefault: true })
      toast.show({ tone: 'success', title: `${address.label} es tu dirección predeterminada` })
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos actualizarla', description: error.message })
    }
  }

  async function handleDelete() {
    try {
      await deleteAddress.mutateAsync(deleting.id)
      toast.show({ title: 'Dirección eliminada' })
      setDeleting(null)
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos eliminarla', description: error.message })
    }
  }

  const addButton = (
    <Button iconStart="plus" onClick={() => setEditing('new')}>
      Agregar dirección
    </Button>
  )

  return (
    <div className="addresses-page">
      <div className="addresses-page__header">
        <PageHeader title="Direcciones" description="Donde recibes tus pedidos." />
        {query.data?.length > 0 && addButton}
      </div>

      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="10rem" />}
        isEmpty={(addresses) => addresses.length === 0}
        empty={
          <EmptyState
            icon="inbox"
            title="Aún no tienes direcciones"
            description="Agrega una para que el checkout sea más rápido."
            action={addButton}
          />
        }
        errorTitle="No pudimos cargar tus direcciones"
      >
        {(addresses) => (
          <ul className="addresses-page__list" role="list">
            {addresses.map((address) => (
              <li key={address.id}>
                <AddressCard
                  address={address}
                  onEdit={() => setEditing(address)}
                  onDelete={() => setDeleting(address)}
                  onMakeDefault={() => handleMakeDefault(address)}
                  isBusy={updateAddress.isPending}
                />
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nueva dirección' : 'Editar dirección'}
        size="lg"
      >
        {editing !== null && (
          <AddressForm
            // key: cada dirección abre el formulario con sus propios valores.
            key={editing === 'new' ? 'new' : editing.id}
            initialValues={editing === 'new' ? undefined : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar dirección"
        description={deleting && `¿Eliminar "${deleting.label}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={deleteAddress.isPending}
      />
    </div>
  )
}
