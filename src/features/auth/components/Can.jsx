import { usePermission } from '../hooks/usePermission'

export function Can({ permission, fallback = null, children }) {
  return usePermission(permission) ? children : fallback
}
