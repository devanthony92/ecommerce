import { useEffect, useState } from 'react'

// true cuando el elemento salió de la pantalla por arriba o por abajo.
// Sin IntersectionObserver (tests, navegadores viejos) se asume visible.
export function useIsOffscreen(ref) {
  const [isOffscreen, setIsOffscreen] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setIsOffscreen(!entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return isOffscreen
}
