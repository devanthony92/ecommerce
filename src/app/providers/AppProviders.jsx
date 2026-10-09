import { AuthProvider } from './AuthProvider'
import { CartProvider } from './CartProvider'
import { QueryProvider } from './QueryProvider'
import { UiProvider } from './UiProvider'

export function AppProviders({ queryClient, children }) {
  return (
    <QueryProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <UiProvider>{children}</UiProvider>
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
