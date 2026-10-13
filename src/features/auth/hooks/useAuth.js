import { useContext } from 'react'
import { CurrentUserContext } from '../CurrentUserContext'

export function useAuth() {
  const context = useContext(CurrentUserContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <CurrentUserContext.Provider>.')
  }
  return context
}
