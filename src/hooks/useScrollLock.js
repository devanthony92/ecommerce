import { useEffect } from 'react'

// Contador global: si hay overlays anidados (modal sobre drawer),
// el scroll se libera solo cuando se cierra el último.
let locks = 0
let previous = null

function lock() {
  if (locks === 0) {
    const { body, documentElement } = document
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    body.style.overflow = 'hidden'
    // Evita el salto horizontal al desaparecer la barra de scroll.
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`
  }
  locks += 1
}

function unlock() {
  locks = Math.max(0, locks - 1)
  if (locks === 0 && previous) {
    document.body.style.overflow = previous.overflow
    document.body.style.paddingRight = previous.paddingRight
    previous = null
  }
}

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined
    lock()
    return unlock
  }, [active])
}
