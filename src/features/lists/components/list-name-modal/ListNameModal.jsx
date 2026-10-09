import { useRef } from 'react'
import { Modal } from '@/components/modal'
import { StackedForm, TextField } from '@/components/ui'
import { useForm } from '@/hooks/useForm'

const validate = ({ name }) => {
  const clean = name.trim()
  if (!clean) return { name: 'Ponle un nombre a la lista.' }
  if (clean.length > 40) return { name: 'Máximo 40 caracteres.' }
  return {}
}

function NameForm({ initialName, submitLabel, onSubmit, inputRef }) {
  const { field, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { name: initialName },
    validate,
    onSubmit: ({ name }) => onSubmit(name.trim()),
  })

  return (
    <StackedForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
    >
      <TextField
        ref={inputRef}
        label="Nombre de la lista"
        placeholder="Mi tienda, Pedido mensual…"
        maxLength={40}
        required
        {...field('name')}
      />
    </StackedForm>
  )
}

// Crear o renombrar una lista. `onSubmit(name)` devuelve una promesa.
export function ListNameModal({ open, onClose, title, initialName = '', submitLabel, onSubmit }) {
  const inputRef = useRef(null)

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" initialFocusRef={inputRef}>
      {open && (
        <NameForm
          initialName={initialName}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
          inputRef={inputRef}
        />
      )}
    </Modal>
  )
}
