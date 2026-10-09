import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import { ROLES } from '@/constants/statuses'

// Llamado a la acción del programa mayorista según quién mira.
export function useWholesaleCta() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return {
      to: `${paths.register}?next=${encodeURIComponent(paths.wholesaleRequest)}`,
      label: 'Crear cuenta y solicitar',
    }
  }
  if (user.role === ROLES.WHOLESALE) {
    return { to: paths.wholesale, label: 'Ir a mi panel mayorista' }
  }
  if (['PENDING', 'UNDER_REVIEW'].includes(user.wholesale?.requestStatus)) {
    return { to: paths.wholesaleRequest, label: 'Ver mi solicitud' }
  }
  return { to: paths.wholesaleRequest, label: 'Solicitar cuenta mayorista' }
}
