import { useCallback, useEffect, useRef, useState } from 'react'

// Por debajo de esto es un clic, no un arrastre.
const DRAG_THRESHOLD = 5
// Inercia: la velocidad (px/ms) se multiplica por FRICTION cada 16 ms.
const FRICTION = 0.94
const MIN_SPEED = 0.02
// Tope de impulso (px/ms): un tirón brusco no cruza media pista.
const MAX_SPEED = 3
// Si el mouse se detuvo antes de soltar, no hay impulso.
const STILL_MS = 100

/**
 * Arrastrar la pista con el mouse y soltarla con inercia (solo
 * `pointerType === 'mouse'`; el táctil ya usa el scroll nativo).
 * Mientras dura, `dragging` es true: la pista apaga el scroll-snap y el
 * avance automático se detiene. Al terminar llama a `onEnd` para que vuelva
 * a alinearse. Un arrastre nunca dispara el clic del enlace de debajo.
 * `recenter()` se llama tras cada movimiento: si salta entre copias del bucle
 * infinito, devuelve los px que movió la pista para seguir el gesto desde ahí.
 */
export function useMouseDrag(trackRef, { reducedMotion, onEnd, recenter }) {
  const dragRef = useRef(null)
  const frameRef = useRef(0)
  const suppressClickRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const finish = useCallback(() => {
    dragRef.current = null
    setDragging(false)
    onEnd()
  }, [onEnd])

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    cancelAnimationFrame(frameRef.current)
    suppressClickRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: trackRef.current.scrollLeft,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    const dx = event.clientX - drag.startX
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      drag.moved = true
      trackRef.current.setPointerCapture?.(event.pointerId)
      setDragging(true)
    }
    const dt = Math.max(event.timeStamp - drag.lastTime, 1)
    // Media móvil: un solo evento brusco no decide el impulso.
    drag.velocity = 0.8 * ((event.clientX - drag.lastX) / dt) + 0.2 * drag.velocity
    drag.lastX = event.clientX
    drag.lastTime = event.timeStamp
    trackRef.current.scrollLeft = drag.startLeft - dx
    drag.startLeft += recenter()
  }

  const onPointerUp = (event) => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    if (!drag.moved) {
      dragRef.current = null
      return
    }
    suppressClickRef.current = true
    const still = event.timeStamp - drag.lastTime > STILL_MS
    if (reducedMotion || still || event.type === 'pointercancel') {
      finish()
      return
    }

    const track = trackRef.current
    let velocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, drag.velocity))
    let last = performance.now()
    const step = (now) => {
      const dt = now - last
      last = now
      const before = track.scrollLeft
      track.scrollLeft = before - velocity * dt
      const blocked = track.scrollLeft === before && velocity !== 0
      recenter()
      velocity *= FRICTION ** (dt / 16)
      // Se detiene al frenar o si choca con el borde de la pista.
      if (Math.abs(velocity) > MIN_SPEED && !blocked) {
        frameRef.current = requestAnimationFrame(step)
      } else finish()
    }
    frameRef.current = requestAnimationFrame(step)
  }

  // Para quien escucha el scroll: durante el arrastre la posición la manda el mouse.
  const isDragging = useCallback(() => dragRef.current !== null, [])

  return {
    dragging,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      // Sin esto el navegador arrastra el enlace o la imagen (drag and drop nativo).
      onDragStart: (event) => event.preventDefault(),
      onClickCapture: (event) => {
        if (!suppressClickRef.current) return
        suppressClickRef.current = false
        event.preventDefault()
        event.stopPropagation()
      },
    },
  }
}
