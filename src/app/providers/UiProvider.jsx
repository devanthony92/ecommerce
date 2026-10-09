import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { UiContext } from '@/hooks/useUi'

// Un solo panel abierto a la vez: abrir el carrito cierra el menú móvil.
// Al navegar se cierra cualquier panel abierto.
export function UiProvider({ children }) {
  const { pathname } = useLocation()
  const [panel, setPanel] = useState({ name: null, pathname })

  // Panel abierto en otra ruta = cerrado (derivado en render, sin efecto).
  const openPanel = panel.pathname === pathname ? panel.name : null

  const open = useCallback((name) => setPanel({ name, pathname }), [pathname])
  const close = useCallback(() => setPanel((current) => ({ ...current, name: null })), [])

  const value = useMemo(
    () => ({ openPanel, isOpen: (name) => openPanel === name, open, close }),
    [openPanel, open, close],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
