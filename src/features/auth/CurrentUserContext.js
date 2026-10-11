import { createContext } from 'react'

// Sesión global: `currentUser` (null sin sesión) y las acciones de autorización.
// La provee el componente App con CurrentUserContext.Provider.
export const CurrentUserContext = createContext(null)
