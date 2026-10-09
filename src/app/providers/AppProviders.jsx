import { ToastProvider } from '@/components/feedback'
import { AuthProvider } from './AuthProvider'
import { CartProvider } from './CartProvider'
import { LoginPromptProvider } from './LoginPromptProvider'
import { QueryProvider } from './QueryProvider'
import { UiProvider } from './UiProvider'

export function AppProviders({ queryClient, children }) {
  return (
    <QueryProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <UiProvider>
              <LoginPromptProvider>{children}</LoginPromptProvider>
            </UiProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  )
}
