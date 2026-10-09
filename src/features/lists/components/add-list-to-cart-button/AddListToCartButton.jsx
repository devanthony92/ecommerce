import { useToast } from '@/components/feedback'
import { Button } from '@/components/ui'
import { PANELS, useUi } from '@/hooks/useUi'
import { useAddListToCart } from '../../hooks/useLists'

// Agrega la lista completa al carrito; avisa lo agotado y abre el carrito.
export function AddListToCartButton({ list, size = 'sm', variant = 'secondary' }) {
  const toast = useToast()
  const { open } = useUi()
  const addToCart = useAddListToCart()

  async function handleClick() {
    try {
      const cart = await addToCart.mutateAsync(list.id)
      const skipped = cart.warnings.filter((warning) => warning.code === 'LIST_ITEM_UNAVAILABLE')
      toast.show({
        tone: skipped.length ? 'warning' : 'success',
        title: `Agregamos "${list.name}" al carrito`,
        description: skipped.length
          ? skipped.map((warning) => warning.message).join(' ')
          : undefined,
      })
      open(PANELS.CART)
    } catch (error) {
      toast.show({
        tone: 'danger',
        title: 'No pudimos agregar la lista',
        description: error.message,
      })
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      iconStart="bag"
      loading={addToCart.isPending}
      onClick={handleClick}
      aria-label={`Agregar la lista ${list.name} al carrito`}
    >
      Agregar lista al carrito
    </Button>
  )
}
