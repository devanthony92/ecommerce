import { useId, useState } from 'react'
import { QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { Modal } from '@/components/modal'
import { Button, ChoiceCard, TextField } from '@/components/ui'
import { useAddToList, useCreateList, useLists } from '../../hooks/useLists'
import './add-to-list-modal.scss'

const NEW_LIST = '__new__'

/**
 * Guarda una variante en una lista existente o en una nueva.
 * `item`: { variantId, quantity, label } — label describe el producto para los avisos.
 */
export function AddToListModal({ open, onClose, item }) {
  const name = useId()
  const toast = useToast()
  const query = useLists({ enabled: open })
  const createList = useCreateList()
  const addToList = useAddToList()
  const [choice, setChoice] = useState(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)

  const lists = query.data ?? []
  // Por defecto, la lista usada más recientemente (o "nueva" si no hay ninguna).
  const selected = choice ?? (lists[0]?.id || NEW_LIST)
  const isSaving = createList.isPending || addToList.isPending

  async function handleSave() {
    setError(null)
    try {
      let listId = selected
      let listName = lists.find((list) => list.id === selected)?.name
      if (selected === NEW_LIST) {
        if (!newName.trim()) {
          setError('Ponle un nombre a la lista.')
          return
        }
        const created = await createList.mutateAsync(newName.trim())
        listId = created.id
        listName = created.name
      }
      await addToList.mutateAsync({ listId, variantId: item.variantId, quantity: item.quantity })
      toast.show({ tone: 'success', title: `Guardado en "${listName}"`, description: item.label })
      setChoice(null)
      setNewName('')
      onClose()
    } catch (saveError) {
      setError(saveError.details?.name ?? saveError.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Guardar en una lista"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Guardar
          </Button>
        </>
      }
    >
      <p className="add-to-list-modal__item">
        {item.label} × {item.quantity}
      </p>
      <QueryBoundary query={query} loading={<Skeleton lines={3} />}>
        {() => (
          <fieldset className="add-to-list-modal__options">
            <legend className="add-to-list-modal__legend">Elige una lista</legend>
            {lists.map((list) => (
              <ChoiceCard
                key={list.id}
                name={name}
                value={list.id}
                checked={selected === list.id}
                onChange={setChoice}
                title={list.name}
                description={`${list.itemsCount} productos`}
              />
            ))}
            <ChoiceCard
              name={name}
              value={NEW_LIST}
              checked={selected === NEW_LIST}
              onChange={setChoice}
              title="Nueva lista"
            />
            {selected === NEW_LIST && (
              <TextField
                label="Nombre de la nueva lista"
                maxLength={40}
                value={newName}
                error={error}
                onChange={(event) => setNewName(event.target.value)}
              />
            )}
          </fieldset>
        )}
      </QueryBoundary>
      {error && selected !== NEW_LIST && (
        <p className="add-to-list-modal__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
