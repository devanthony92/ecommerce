import { useState } from 'react'
import { EmptyState, QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui'
import { ListCard } from '../components/list-card/ListCard'
import { ListNameModal } from '../components/list-name-modal/ListNameModal'
import { useCreateList, useLists } from '../hooks/useLists'
import './lists-page.scss'

export default function ListsPage() {
  const toast = useToast()
  const query = useLists()
  const createList = useCreateList()
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(name) {
    await createList.mutateAsync(name)
    toast.show({ tone: 'success', title: `Creaste la lista "${name}"` })
    setIsCreating(false)
  }

  const createButton = (
    <Button iconStart="plus" onClick={() => setIsCreating(true)}>
      Nueva lista
    </Button>
  )

  return (
    <div className="lists-page">
      <div className="lists-page__header">
        <PageHeader
          title="Listas de compra"
          description="Arma listas con tus cantidades habituales y agrégalas completas al carrito."
        />
        {query.data?.length > 0 && createButton}
      </div>

      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="10rem" />}
        isEmpty={(lists) => lists.length === 0}
        empty={
          <EmptyState
            icon="inbox"
            title="Aún no tienes listas"
            description='Por ejemplo "Mi tienda", "Pedido mensual" o "Temporada".'
            action={createButton}
          />
        }
        errorTitle="No pudimos cargar tus listas"
      >
        {(lists) => (
          <ul className="lists-page__grid" role="list">
            {lists.map((list) => (
              <li key={list.id}>
                <ListCard list={list} />
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      <ListNameModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        title="Nueva lista"
        submitLabel="Crear lista"
        onSubmit={handleCreate}
      />
    </div>
  )
}
