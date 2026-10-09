import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * const toast = useToast()
 * toast.show({ title: 'Agregado al carrito', tone: 'success' })
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.')
  }
  return context
}
