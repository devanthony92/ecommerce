import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '@/app/App'
import { createQueryClient } from '@/app/providers/queryClient'

export function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App queryClient={createQueryClient()} />
    </MemoryRouter>,
  )
}
