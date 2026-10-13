import { useContext } from 'react'
import { AuthModalContext } from '../AuthModalContext'

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal debe usarse dentro de <AuthModalProvider>.')
  }
  return context
}
