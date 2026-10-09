import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { CartContext, EMPTY_CART, cartApi, cartKeys } from '@/features/cart'
import { SESSION_STATUS } from '@/constants/statuses'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'

// Guarda solo { variantId, quantity }: los precios siempre los calcula el backend.
function addGuestItem(items, variantId, quantity) {
  const existing = items.find((item) => item.variantId === variantId)
  if (!existing) return [...items, { variantId, quantity }]
  return items.map((item) =>
    item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item,
  )
}

function updateGuestItem(items, variantId, { quantity, variantId: nextVariantId }) {
  let next = items
  let current = variantId
  if (nextVariantId && nextVariantId !== current) {
    const moved = next.find((item) => item.variantId === current)
    next = addGuestItem(
      next.filter((item) => item.variantId !== current),
      nextVariantId,
      moved?.quantity ?? 0,
    )
    current = nextVariantId
  }
  if (quantity !== undefined) {
    next =
      quantity <= 0
        ? next.filter((item) => item.variantId !== current)
        : next.map((item) => (item.variantId === current ? { ...item, quantity } : item))
  }
  return next
}

/**
 * Carrito unificado. Los componentes usan useCart() sin saber el origen:
 * - Invitado: ítems en localStorage, precios vía POST /cart/quote.
 * - Autenticado: carrito en el servidor.
 * - Al iniciar sesión: el carrito de invitado se fusiona (POST /cart/merge).
 */
export function CartProvider({ children }) {
  const { status, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [guestItems, setGuestItems] = useState(() => storage.get(STORAGE_KEYS.guestCart, []))
  const isGuest = status === SESSION_STATUS.ANONYMOUS
  const needsMerge = isAuthenticated && guestItems.length > 0
  const mergingRef = useRef(false)

  useEffect(() => {
    storage.set(STORAGE_KEYS.guestCart, guestItems)
  }, [guestItems])

  const guestQuery = useQuery({
    queryKey: cartKeys.guest(guestItems),
    queryFn: () => cartApi.quote(guestItems),
    enabled: isGuest && guestItems.length > 0,
    placeholderData: keepPreviousData,
  })

  // Mientras se fusiona no se pide el carrito: evita mostrar uno sin los ítems de invitado.
  const serverQuery = useQuery({
    queryKey: cartKeys.server(),
    queryFn: cartApi.get,
    enabled: isAuthenticated && !needsMerge,
  })

  const setServerCart = useCallback(
    (cart) => queryClient.setQueryData(cartKeys.server(), cart),
    [queryClient],
  )

  useEffect(() => {
    if (!needsMerge || mergingRef.current) return
    mergingRef.current = true
    cartApi
      .merge(guestItems)
      .then((cart) => {
        setServerCart(cart)
        setGuestItems([])
      })
      .catch(() => {
        // Si falla, los ítems siguen en el navegador y se reintenta en el próximo inicio.
      })
      .finally(() => {
        mergingRef.current = false
      })
  }, [needsMerge, guestItems, setServerCart])

  const mutation = useMutation({
    mutationFn: (request) => request(),
    onSuccess: setServerCart,
  })
  const runOnServer = mutation.mutateAsync

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (isAuthenticated) return runOnServer(() => cartApi.addItem({ variantId, quantity }))
      setGuestItems((items) => addGuestItem(items, variantId, quantity))
    },
    [isAuthenticated, runOnServer],
  )

  const addItems = useCallback(
    async (items) => {
      if (isAuthenticated) return runOnServer(() => cartApi.addItems(items))
      setGuestItems((current) =>
        items.reduce((acc, item) => addGuestItem(acc, item.variantId, item.quantity), current),
      )
    },
    [isAuthenticated, runOnServer],
  )

  // En invitado el id del ítem es su variantId.
  const updateItem = useCallback(
    async (itemId, changes) => {
      if (isAuthenticated) return runOnServer(() => cartApi.updateItem(itemId, changes))
      setGuestItems((items) => updateGuestItem(items, itemId, changes))
    },
    [isAuthenticated, runOnServer],
  )

  const removeItem = useCallback(
    async (itemId) => {
      if (isAuthenticated) return runOnServer(() => cartApi.removeItem(itemId))
      setGuestItems((items) => items.filter((item) => item.variantId !== itemId))
    },
    [isAuthenticated, runOnServer],
  )

  const guestEmpty = isGuest && guestItems.length === 0
  const activeQuery = isAuthenticated ? serverQuery : guestQuery
  const cart = guestEmpty ? EMPTY_CART : activeQuery.data

  const value = useMemo(
    () => ({
      cart,
      // Estado para QueryBoundary: el invitado sin ítems no consulta nada.
      query: guestEmpty
        ? {
            isPending: false,
            isError: false,
            isFetching: false,
            data: EMPTY_CART,
            refetch: () => {},
          }
        : activeQuery,
      isUpdating: mutation.isPending || activeQuery.isPlaceholderData || needsMerge,
      // Invitado: el conteo local se ve al instante; cuando la cotización está al día
      // se usa la del backend (no cuenta agotados).
      itemsCount:
        isAuthenticated || (cart && !activeQuery.isPlaceholderData)
          ? (cart?.summary.itemsCount ?? 0)
          : guestItems.reduce((total, item) => total + item.quantity, 0),
      addItem,
      addItems,
      updateItem,
      removeItem,
    }),
    [
      cart,
      guestEmpty,
      activeQuery,
      mutation.isPending,
      needsMerge,
      isAuthenticated,
      guestItems,
      addItem,
      addItems,
      updateItem,
      removeItem,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
