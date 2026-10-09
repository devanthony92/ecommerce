import { useAuth } from './useAuth'

// UX solamente: el backend valida cada acción.
export function usePermission(permission) {
  const { user } = useAuth()
  return Boolean(user?.permissions?.includes(permission))
}
