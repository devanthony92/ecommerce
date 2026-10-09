import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

function Harness({ closeOnBackdrop }) {
  const [open, setOpen] = useState(false)
  const [innerOpen, setInnerOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Mi modal"
        closeOnBackdrop={closeOnBackdrop}
      >
        <button type="button">Primero</button>
        <button type="button" onClick={() => setInnerOpen(true)}>
          Último
        </button>
        <Modal open={innerOpen} onClose={() => setInnerOpen(false)} title="Interno">
          <p>Interno</p>
        </Modal>
      </Modal>
    </>
  )
}

const dialog = (name) => screen.queryByRole('dialog', { name })

describe('Modal', () => {
  it('abre con rol dialog, aria-modal y título accesible', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    const modal = screen.getByRole('dialog', { name: 'Mi modal' })
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('mueve el foco adentro, lo atrapa y lo devuelve al cerrar con ESC', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    await user.click(trigger)

    // Primer foco: botón cerrar del header.
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus()

    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Último' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(dialog('Mi modal')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('cierra al hacer click en el backdrop solo si está habilitado', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Harness closeOnBackdrop={false} />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.click(document.querySelector('.modal__backdrop'))
    expect(dialog('Mi modal')).toBeInTheDocument()
    unmount()

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.click(document.querySelector('.modal__backdrop'))
    await waitFor(() => expect(dialog('Mi modal')).not.toBeInTheDocument())
  })

  it('con modales anidados ESC cierra solo el superior', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.click(screen.getByRole('button', { name: 'Último' }))
    expect(dialog('Interno')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(dialog('Interno')).not.toBeInTheDocument())
    expect(dialog('Mi modal')).toBeInTheDocument()
  })
})
