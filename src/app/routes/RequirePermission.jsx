import { Outlet } from 'react-router'
import { usePermission } from '@/features/auth'
import { ForbiddenPage } from './ForbiddenPage'

// Va anidado dentro de <ProtectedRoute>. Solo UX: el backend valida cada request.
export function RequirePermission({ permission }) {
  return usePermission(permission) ? <Outlet /> : <ForbiddenPage />
}
