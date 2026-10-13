import clsx from 'clsx'
import { useToast } from '@/components/feedback'
import { Icon } from '@/components/ui'
import { useAuth, useRequireAuth } from '@/features/auth'
import { useToggleInspiration } from '../../hooks/useSavedInspirations'
import './save-photo-button.scss'

/**
 * Guardar una foto en "Mis inspiraciones".
 * - Sin sesión: icono inactivo; al pasar el cursor dice "Inicia sesión para
 *   guardar". Al hacer clic abre el registro (con acceso al inicio de sesión)
 *   y, al ingresar, la guarda.
 * - Con sesión: guarda o quita; guardada se ve en azul y rellena.
 */
export function SavePhotoButton({ photo, keyword, saved, className }) {
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const requireAuth = useRequireAuth()
  const toggle = useToggleInspiration()
  const isSaved = isAuthenticated && Boolean(saved)

  function handleClick() {
    requireAuth(
      () =>
        toggle.mutate(
          // Tras un inicio de sesión en modal, la foto se guarda (no se alterna).
          { photo, keyword, saved: isAuthenticated ? saved : null },
          {
            onError: (error) =>
              toast.show({
                tone: 'danger',
                title: 'No pudimos actualizar tus inspiraciones',
                description: error.message,
              }),
          },
        ),
      // Sin cuenta se ofrece registrarse (con la opción de iniciar sesión); el
      // guardado queda pendiente y se hace al ingresar.
      { mode: 'register', notice: 'Para guardar esta foto necesitas una cuenta.' },
    )
  }

  const label = !isAuthenticated
    ? 'Inicia sesión para guardar'
    : isSaved
      ? 'Quitar de mis inspiraciones'
      : 'Guardar en mis inspiraciones'

  return (
    <span className={clsx('save-photo-button', className)}>
      <button
        type="button"
        className={clsx(
          'save-photo-button__button',
          !isAuthenticated && 'save-photo-button__button--inactive',
          isSaved && 'save-photo-button__button--saved',
        )}
        aria-label={label}
        aria-pressed={isAuthenticated ? isSaved : undefined}
        aria-busy={toggle.isPending || undefined}
        onClick={handleClick}
      >
        <Icon name="bookmark" className="save-photo-button__icon" />
      </button>
      {!isAuthenticated && (
        <span className="save-photo-button__tooltip" aria-hidden="true">
          Inicia sesión para guardar
        </span>
      )}
    </span>
  )
}
