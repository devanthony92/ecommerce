import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import { ROLES } from '@/constants/statuses'

// Llamado a la acción del programa mayorista según quién mira.
// kind: register | panel | status | apply
export function useWholesaleCta() {
  const { currentUser: user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return {
      to: `${paths.register}?next=${encodeURIComponent(paths.wholesaleRequest)}`,
      label: 'Crear cuenta y solicitar',
      kind: 'register',
    }
  }
  if (user.role === ROLES.WHOLESALE) {
    return { to: paths.wholesale, label: 'Ir a mi panel mayorista', kind: 'panel' }
  }
  if (['PENDING', 'UNDER_REVIEW'].includes(user.wholesale?.requestStatus)) {
    return { to: paths.wholesaleRequest, label: 'Ver mi solicitud', kind: 'status' }
  }
  return { to: paths.wholesaleRequest, label: 'Solicitar cuenta mayorista', kind: 'apply' }
}
