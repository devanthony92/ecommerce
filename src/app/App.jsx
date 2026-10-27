import { CurrentUserContext, useSession } from '@/features/auth'
import { AuthModalProvider } from './providers/AuthModalProvider'
import { CartProvider } from './providers/CartProvider'
import { UiProvider } from './providers/UiProvider'
import { AppRoutes } from './routes/AppRoutes'

/**
 * Raíz de la aplicación. La sesión (currentUser y las acciones de
 * autorización) se comparte con toda la app mediante CurrentUserContext.
 */
export function App() {
  const session = useSession()

  return (
    <CurrentUserContext.Provider value={session}>
      <CartProvider>
        <UiProvider>
          <AuthModalProvider>
            <AppRoutes />
          </AuthModalProvider>
        </UiProvider>
      </CartProvider>
    </CurrentUserContext.Provider>
  )
}
