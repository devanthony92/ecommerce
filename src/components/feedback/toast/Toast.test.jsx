import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from './ToastProvider'
import { useToast } from './useToast'

function Trigger({ options }) {
  const toast = useToast()
  return (
    <button type="button" onClick={() => toast.show(options)}>
      Notificar
    </button>
  )
}

describe('Toast', () => {
  it('muestra el toast, se cierra con el botón y los errores usan role alert', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Trigger options={{ title: 'No se pudo guardar', tone: 'danger', duration: null }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Notificar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar')

    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
    expect(screen.queryByText('No se pudo guardar')).not.toBeInTheDocument()
  })

  it('se cierra solo al terminar la duración', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <Trigger options={{ title: 'Producto agregado', duration: 3000 }} />
      </ToastProvider>,
    )
    act(() => screen.getByRole('button', { name: 'Notificar' }).click())
    expect(screen.getByText('Producto agregado')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByText('Producto agregado')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
