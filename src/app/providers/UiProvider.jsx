import { useCallback, useMemo, useState } from 'react'
import { UiContext } from '@/hooks/useUi'

// Un solo panel abierto a la vez: abrir el carrito cierra el menú móvil.
export function UiProvider({ children }) {
  const [openPanel, setOpenPanel] = useState(null)

  const open = useCallback((panel) => setOpenPanel(panel), [])
  const close = useCallback(() => setOpenPanel(null), [])

  const value = useMemo(
    () => ({ openPanel, isOpen: (panel) => openPanel === panel, open, close }),
    [openPanel, open, close],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
