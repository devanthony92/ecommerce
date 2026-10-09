import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from './queryClient'

export function QueryProvider({ client, children }) {
  const [queryClient] = useState(() => client ?? createQueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
