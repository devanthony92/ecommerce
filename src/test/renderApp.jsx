import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '@/app/App'
import { AppProviders } from '@/app/providers/AppProviders'
import { createQueryClient } from '@/app/providers/queryClient'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'

// Usuarios semilla del backend simulado (src/services/api/mocks/db.js).
const SESSIONS = {
  buyer: 'mock-token-u-buyer',
  wholesale: 'mock-token-u-wholesale',
}

/**
 * Renderiza la app completa en `route`.
 * `as`: 'buyer' | 'wholesale' arranca con sesión iniciada.
 */
export function renderApp(route = '/', { as } = {}) {
  if (as) storage.set(STORAGE_KEYS.token, SESSIONS[as])

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders queryClient={createQueryClient()}>
        <App />
      </AppProviders>
    </MemoryRouter>,
  )
}
