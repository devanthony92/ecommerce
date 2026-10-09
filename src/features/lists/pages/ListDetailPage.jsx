import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton, useToast } from '@/components/feedback'
import { Breadcrumbs, PageHeader } from '@/components/layout'
import { ConfirmModal } from '@/components/modal'
import { Button } from '@/components/ui'
import { paths } from '@/constants/paths'
import { AddListToCartButton } from '../components/add-list-to-cart-button/AddListToCartButton'
import { ListItemRow } from '../components/list-item-row/ListItemRow'
import { ListNameModal } from '../components/list-name-modal/ListNameModal'
import { useDeleteList, useList, useRenameList } from '../hooks/useLists'
import './list-detail-page.scss'

function ListDetail({ list }) {
  const toast = useToast()
  const navigate = useNavigate()
  const renameList = useRenameList()
  const deleteList = useDeleteList()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleRename(name) {
    await renameList.mutateAsync({ id: list.id, name })
    toast.show({ tone: 'success', title: 'Nombre actualizado' })
    setIsRenaming(false)
  }

  async function handleDelete() {
    try {
      await deleteList.mutateAsync(list.id)
      toast.show({ title: `Eliminaste la lista "${list.name}"` })
      navigate(paths.lists, { replace: true })
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No pudimos eliminarla', description: error.message })
    }
  }

  return (
    <div className="list-detail">
      <PageHeader
        title={list.name}
        description={`${list.itemsCount} productos · ${list.unitsCount} unidades`}
      />
      <div className="list-detail__actions">
        {list.itemsCount > 0 && <AddListToCartButton list={list} size="md" variant="primary" />}
        <Button variant="secondary" onClick={() => setIsRenaming(true)}>
          Renombrar
        </Button>
        <Button variant="ghost" onClick={() => setIsDeleting(true)} className="list-detail__delete">
          Eliminar lista
        </Button>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Esta lista está vacía"
          description='Desde cualquier producto usa "Guardar en lista".'
          action={
            <Button as={Link} to={paths.catalog} variant="secondary">
              Ver catálogo
            </Button>
          }
        />
      ) : (
        <ul className="list-detail__items" role="list" aria-label={`Productos de ${list.name}`}>
          {list.items.map((item) => (
            <li key={item.id}>
              <ListItemRow listId={list.id} item={item} />
            </li>
          ))}
        </ul>
      )}

      <ListNameModal
        open={isRenaming}
        onClose={() => setIsRenaming(false)}
        title="Renombrar lista"
        initialName={list.name}
        submitLabel="Guardar"
        onSubmit={handleRename}
      />
      <ConfirmModal
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Eliminar lista"
        description={`¿Eliminar "${list.name}"? Los productos no se borran del catálogo.`}
        confirmLabel="Eliminar"
        isLoading={deleteList.isPending}
      />
    </div>
  )
}

export default function ListDetailPage() {
  const { listId } = useParams()
  const query = useList(listId)

  return (
    <>
      <Breadcrumbs
        items={[
          { to: paths.lists, label: 'Listas de compra' },
          { label: query.data?.name ?? 'Lista' },
        ]}
      />
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="14rem" />}
        errorTitle="No encontramos esta lista"
      >
        {(list) => <ListDetail list={list} />}
      </QueryBoundary>
    </>
  )
}
