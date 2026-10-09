import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from '@/features/cart'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'

// Fase 1: solo carrito de invitado en localStorage ({ variantId, quantity }).
// Fase 6: precios vía /cart/quote, carrito en servidor al autenticarse y merge al login.
// Los componentes siempre consumen useCart(), así el origen de los datos no les importa.
export function CartProvider({ children }) {
  const [guestItems, setGuestItems] = useState(() => storage.get(STORAGE_KEYS.guestCart, []))

  useEffect(() => {
    storage.set(STORAGE_KEYS.guestCart, guestItems)
  }, [guestItems])

  const addItem = useCallback((variantId, quantity = 1) => {
    setGuestItems((items) => {
      const existing = items.find((item) => item.variantId === variantId)
      if (!existing) return [...items, { variantId, quantity }]
      return items.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item,
      )
    })
  }, [])

  const updateQuantity = useCallback((variantId, quantity) => {
    setGuestItems((items) =>
      quantity <= 0
        ? items.filter((item) => item.variantId !== variantId)
        : items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
    )
  }, [])

  const removeItem = useCallback((variantId) => {
    setGuestItems((items) => items.filter((item) => item.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setGuestItems([]), [])

  const value = useMemo(
    () => ({
      items: guestItems,
      itemsCount: guestItems.reduce((total, item) => total + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [guestItems, addItem, updateQuantity, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
