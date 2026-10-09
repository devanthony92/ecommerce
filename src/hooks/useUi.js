import { createContext, useContext } from 'react'

export const PANELS = Object.freeze({
  CART: 'cart',
  MOBILE_MENU: 'mobile-menu',
})

export const UiContext = createContext(null)

// Estado de paneles globales (drawer de carrito, menú móvil).
export function useUi() {
  const context = useContext(UiContext)
  if (!context) {
    throw new Error('useUi debe usarse dentro de <UiProvider>.')
  }
  return context
}
