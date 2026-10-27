import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../api/chatApi'

// Sin GEMINI_API_KEY en el backend (o si la consulta falla) el asistente no se muestra.
export function useChatStatus() {
  return useQuery({
    queryKey: ['chat', 'status'],
    queryFn: chatApi.status,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
