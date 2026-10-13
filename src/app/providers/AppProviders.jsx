import { ToastProvider } from '@/components/feedback'
import { QueryProvider } from './QueryProvider'

// Proveedores que no dependen de la sesión. El resto los arma App.
export function AppProviders({ queryClient, children }) {
  return (
    <QueryProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  )
}
