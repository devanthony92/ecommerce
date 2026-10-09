import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import { catalogKeys } from '../api/catalogKeys'

// Código de la página de detalle: se pide una sola vez (el navegador lo cachea).
const loadProductPage = () => import('../pages/ProductPage')

/**
 * Al pasar el cursor o enfocar una tarjeta se adelantan los datos y el código
 * del detalle: al hacer clic, la página abre sin esperar.
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient()

  return useCallback(
    (slug) => {
      loadProductPage()
      queryClient.prefetchQuery({
        queryKey: catalogKeys.product(slug),
        queryFn: () => catalogApi.getProduct(slug),
        staleTime: 60 * 1000,
      })
    },
    [queryClient],
  )
}
