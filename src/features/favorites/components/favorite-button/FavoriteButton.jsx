import clsx from 'clsx'
import { useToast } from '@/components/feedback'
import { Icon } from '@/components/ui'
import { useAuth, useRequireAuth } from '@/features/auth'
import { useFavoriteIds, useToggleFavorite } from '../../hooks/useFavorites'
import './favorite-button.scss'

/**
 * Corazón de favoritos. Sin sesión abre el login y, al ingresar, guarda el favorito.
 * `product` necesita al menos { id, name } (resumen del catálogo).
 */
export function FavoriteButton({ product, className }) {
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const requireAuth = useRequireAuth()
  const favoriteIds = useFavoriteIds()
  const toggle = useToggleFavorite()
  const isFavorite = isAuthenticated && favoriteIds.has(product.id)

  function save(currentlyFavorite) {
    toggle.mutate(
      { product, isFavorite: currentlyFavorite },
      {
        onError: (error) =>
          toast.show({
            tone: 'danger',
            title: 'No pudimos actualizar tus favoritos',
            description: error.message,
          }),
      },
    )
  }

  return (
    <button
      type="button"
      className={clsx('favorite-button', isFavorite && 'favorite-button--active', className)}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`
      }
      // Tras un login en modal, el producto se agrega (no se alterna).
      onClick={() => requireAuth(() => save(isAuthenticated ? isFavorite : false))}
    >
      <Icon name="heart" className="favorite-button__icon" />
    </button>
  )
}
