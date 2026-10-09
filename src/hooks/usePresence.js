import { useEffect, useState } from 'react'

// Mantiene montado un overlay durante su animación de salida.
// La entrada la resuelve CSS con @starting-style, sin timers ni requestAnimationFrame.
export function usePresence(open, duration = 250) {
  const [isMounted, setIsMounted] = useState(open)

  // Ajuste derivado de `open` durante el render (patrón recomendado por React).
  if (open && !isMounted) setIsMounted(true)

  useEffect(() => {
    if (open) return undefined
    const timer = setTimeout(() => setIsMounted(false), duration)
    return () => clearTimeout(timer)
  }, [open, duration])

  return { isMounted, isVisible: open }
}
