import { QueryClient } from '@tanstack/react-query'

// Reintentar solo fallas de red o del servidor; un 4xx no cambia al reintentar.
function shouldRetry(failureCount, error) {
  const retriable = error?.isNetworkError || error?.status >= 500
  return retriable && failureCount < 2
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
