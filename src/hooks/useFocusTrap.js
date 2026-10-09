import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[inert]') && el.getAttribute('aria-hidden') !== 'true',
  )
}

// Mantiene Tab / Shift+Tab dentro del contenedor y devuelve el foco
// al elemento que lo tenía antes de abrir.
export function useFocusTrap(containerRef, active, { initialFocusRef } = {}) {
  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return undefined

    const previouslyFocused = document.activeElement
    const target = initialFocusRef?.current ?? getFocusable(container)[0] ?? container
    target.focus({ preventScroll: true })

    function handleKeyDown(event) {
      if (event.key !== 'Tab') return
      const focusable = getFocusable(container)
      if (focusable.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [active, containerRef, initialFocusRef])
}
