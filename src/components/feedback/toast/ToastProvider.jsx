import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { ToastContext } from './useToast'
import './toast-region.scss'

const DEFAULT_DURATION = 5000
const MAX_VISIBLE = 3

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  // tone: info | success | warning | danger. duration: ms, o null para no cerrar solo.
  const show = useCallback(({ title, description, tone = 'info', duration = DEFAULT_DURATION }) => {
    nextId.current += 1
    const id = nextId.current
    setToasts((current) =>
      [...current, { id, title, description, tone, duration }].slice(-MAX_VISIBLE),
    )
    return id
  }, [])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Portal fuera de #root: sigue anunciándose aunque un modal deje la app inerte. */}
      {createPortal(
        <section className="toast-region" aria-label="Notificaciones">
          {/* La región existe siempre: los lectores solo anuncian cambios en regiones ya montadas. */}
          <ol className="toast-region__list" aria-live="polite">
            {toasts.map((toast) => (
              <li key={toast.id} className="toast-region__item">
                <Toast {...toast} onDismiss={dismiss} />
              </li>
            ))}
          </ol>
        </section>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
