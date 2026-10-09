import { useEffect, useId, useRef } from 'react'
import { useFocusTrap } from './useFocusTrap'
import { useScrollLock } from './useScrollLock'

// Pila de overlays abiertos: ESC cierra solo el de arriba.
const stack = []

function setAppInert(inert) {
  const root = document.getElementById('root')
  if (root) root.inert = inert
}

/**
 * Comportamiento común de Modal y Drawer: bloqueo de scroll, focus trap,
 * cierre con ESC (solo el overlay superior) y app de fondo inerte.
 */
export function useOverlay({ open, onClose, closeOnEsc = true, initialFocusRef }) {
  const id = useId()
  const containerRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    stack.push(id)
    setAppInert(true)

    function handleKeyDown(event) {
      if (event.key !== 'Escape' || !closeOnEsc) return
      if (stack[stack.length - 1] !== id) return
      event.stopPropagation()
      onCloseRef.current?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      stack.splice(stack.indexOf(id), 1)
      if (stack.length === 0) setAppInert(false)
    }
  }, [open, id, closeOnEsc])

  // Orden importante: React limpia los efectos en orden de declaración. El de arriba
  // quita `inert` de #root antes de que el focus trap devuelva el foco al disparador
  // (un elemento inerte no puede recibir foco).
  useScrollLock(open)
  useFocusTrap(containerRef, open, { initialFocusRef })

  return { containerRef }
}
