import { AppProviders } from './providers/AppProviders'
import { AppRoutes } from './routes/AppRoutes'

export function App({ queryClient }) {
  return (
    <AppProviders queryClient={queryClient}>
      <AppRoutes />
    </AppProviders>
  )
}
