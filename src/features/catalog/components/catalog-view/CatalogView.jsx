import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router'
import { Drawer } from '@/components/drawer'
import { EmptyState, QueryBoundary } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button, Pagination, SelectField } from '@/components/ui'
import { paths } from '@/constants/paths'
import { PANELS, useUi } from '@/hooks/useUi'
import { useCatalogFilters } from '../../hooks/useCatalogFilters'
import { useProducts } from '../../hooks/useProducts'
import { SORT_OPTIONS, toProductsQuery } from '../../utils/catalogFilters'
import { ActiveFilters } from '../active-filters/ActiveFilters'
import { CatalogFilters } from '../catalog-filters/CatalogFilters'
import { ProductGrid, ProductGridSkeleton } from '../product-grid/ProductGrid'
import './catalog-view.scss'

const FILTERS_DRAWER_ID = 'catalog-filters-drawer'

const resultsLabel = (total) => `${total} ${total === 1 ? 'producto' : 'productos'}`

/**
 * Listado de productos con filtros en la URL. Lo usan el catálogo,
 * las categorías, la búsqueda, ofertas y el catálogo mayorista.
 * `baseParams`: filtros fijos de la página (p. ej. { onSale: true }).
 * `intro`: contenido entre el título y la barra de herramientas.
 */
export function CatalogView({
  title,
  description,
  categorySlug,
  baseParams,
  intro,
  showTiers = false,
}) {
  const { filters, activeCount, update, toggleValue, reset, pageHref } = useCatalogFilters()
  const params = useMemo(
    () => ({ ...baseParams, ...toProductsQuery(filters, categorySlug) }),
    [baseParams, filters, categorySlug],
  )
  const query = useProducts(params)
  const { isOpen, open, close } = useUi()
  const resultsRef = useRef(null)
  const previousPage = useRef(filters.page)

  // Al cambiar de página se vuelve al inicio de los resultados.
  useEffect(() => {
    if (previousPage.current === filters.page) return
    previousPage.current = filters.page
    resultsRef.current?.scrollIntoView({ block: 'start' })
  }, [filters.page])

  const data = query.data
  const clearPrice = () => update({ minPrice: null, maxPrice: null })
  const filterProps = {
    facets: data?.facets,
    filters,
    onToggle: toggleValue,
    onPriceChange: update,
  }

  return (
    <div className="catalog-view">
      <PageHeader title={title} description={description} />
      {intro}

      <div className="catalog-view__toolbar">
        <p className="catalog-view__count" aria-live="polite">
          {data && resultsLabel(data.total)}
        </p>
        <Button
          variant="secondary"
          size="sm"
          iconStart="filter"
          className="catalog-view__filters-button"
          aria-haspopup="dialog"
          aria-expanded={isOpen(PANELS.FILTERS)}
          aria-controls={FILTERS_DRAWER_ID}
          onClick={() => open(PANELS.FILTERS)}
        >
          Filtrar{activeCount > 0 && ` (${activeCount})`}
        </Button>
        <SelectField
          label="Ordenar por"
          hideLabel
          options={SORT_OPTIONS}
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value })}
          className="catalog-view__sort"
        />
      </div>

      <ActiveFilters
        filters={filters}
        onToggle={toggleValue}
        onPriceClear={clearPrice}
        onReset={reset}
      />

      <div className="catalog-view__layout">
        <aside className="catalog-view__sidebar" aria-label="Filtros">
          {data && <CatalogFilters {...filterProps} />}
        </aside>

        <div className="catalog-view__results" ref={resultsRef}>
          <QueryBoundary
            query={query}
            loading={<ProductGridSkeleton />}
            isEmpty={(result) => result.items.length === 0}
            empty={
              <EmptyState
                icon="search"
                title="No encontramos productos"
                description={
                  activeCount > 0
                    ? 'Prueba quitando algunos filtros.'
                    : 'Prueba con otra búsqueda o explora el catálogo.'
                }
                action={
                  activeCount > 0 ? (
                    <Button variant="secondary" onClick={reset}>
                      Limpiar filtros
                    </Button>
                  ) : (
                    <Button as={Link} to={paths.catalog} variant="secondary">
                      Ver todo el catálogo
                    </Button>
                  )
                }
              />
            }
            errorTitle="No pudimos cargar los productos"
          >
            {(result) => (
              <>
                <ProductGrid
                  products={result.items}
                  isUpdating={query.isPlaceholderData}
                  showTiers={showTiers}
                />
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  getHref={pageHref}
                  label="Páginas de resultados"
                  className="catalog-view__pagination"
                />
              </>
            )}
          </QueryBoundary>
        </div>
      </div>

      <Drawer
        id={FILTERS_DRAWER_ID}
        open={isOpen(PANELS.FILTERS)}
        onClose={close}
        position="left"
        title="Filtros"
        footer={
          <Button block onClick={close}>
            Ver {data ? resultsLabel(data.total) : 'resultados'}
          </Button>
        }
      >
        {data && <CatalogFilters {...filterProps} />}
      </Drawer>
    </div>
  )
}
