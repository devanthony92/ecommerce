import { useToast } from '@/components/feedback'
import { Button } from '@/components/ui'
import { PANELS, useUi } from '@/hooks/useUi'
import { useReorder } from '../../hooks/useOrderActions'

// Repite un pedido: agrega al carrito lo disponible, avisa lo que no y abre el carrito.
export function ReorderButton({
  order,
  variant = 'secondary',
  size = 'sm',
  label = 'Repetir pedido',
}) {
  const toast = useToast()
  const { open } = useUi()
  const reorder = useReorder()

  async function handleClick() {
    try {
      const cart = await reorder.mutateAsync(order.id)
      const skipped = cart.warnings.filter((warning) => warning.code === 'REORDER_UNAVAILABLE')
      toast.show({
        tone: skipped.length ? 'warning' : 'success',
        title: `Agregamos los productos de ${order.number} al carrito`,
        description: skipped.length
          ? skipped.map((warning) => warning.message).join(' ')
          : undefined,
      })
      open(PANELS.CART)
    } catch (error) {
      toast.show({
        tone: 'danger',
        title: 'No pudimos repetir el pedido',
        description: error.message,
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      iconStart="refresh"
      loading={reorder.isPending}
      onClick={handleClick}
      aria-label={`${label} ${order.number}`}
    >
      {label}
    </Button>
  )
}
