import { EmptyState } from '../empty-state/EmptyState'
import { ErrorState } from '../error-state/ErrorState'
import { LoadingState } from '../loading-state/LoadingState'

/**
 * Renderiza el estado correcto de una query de TanStack Query:
 * Loading → Error (con Reintentar) → Empty → Success.
 *
 * <QueryBoundary
 *   query={productsQuery}
 *   isEmpty={(data) => data.items.length === 0}
 *   loading={<ProductGridSkeleton />}
 *   empty={<EmptyState title="Sin resultados" />}
 * >
 *   {(data) => <ProductGrid products={data.items} />}
 * </QueryBoundary>
 */
export function QueryBoundary({
  query,
  isEmpty,
  loading = <LoadingState />,
  empty = <EmptyState title="No hay nada por aquí todavía" />,
  errorTitle,
  children,
}) {
  if (query.isPending) return loading

  // Si hay datos previos y falla un refetch, se siguen mostrando los datos.
  if (query.isError && query.data === undefined) {
    return (
      <ErrorState
        title={errorTitle}
        error={query.error}
        onRetry={() => query.refetch()}
        isRetrying={query.isFetching}
      />
    )
  }

  if (isEmpty?.(query.data)) return empty

  return children(query.data)
}
