import { useEffect, useId, useRef, useState } from 'react'
import { matchPath, useLocation } from 'react-router'
import { Drawer } from '@/components/drawer'
import { Button, Icon, Spinner } from '@/components/ui'
import { paths } from '@/constants/paths'
import { PANELS, useUi } from '@/hooks/useUi'
import { MAX_MESSAGE_LENGTH, useChatConversation } from '../../hooks/useChatConversation'
import { useChatStatus } from '../../hooks/useChatStatus'
import { whatsappUrl } from '../../utils/whatsapp'
import { ChatMessage } from '../chat-message/ChatMessage'
import './chat-widget.scss'

export const CHAT_DRAWER_ID = 'chat-drawer'

const SUGGESTIONS = [
  '¿Qué camisetas tienen?',
  '¿Cuánto cuesta el envío?',
  '¿Cómo compro por mayor?',
]

const PRODUCT_SUGGESTION = '¿Qué tallas y colores hay de este producto?'

// Desde aquí se muestra cuántos caracteres quedan.
const COUNTER_FROM = MAX_MESSAGE_LENGTH - 100

export function ChatWidget() {
  const { data: status } = useChatStatus()
  const { isOpen, open, close } = useUi()
  // La conversación vive aquí y no en el panel: sobrevive al cerrarlo y al navegar.
  const conversation = useChatConversation()
  // En una ficha de producto, el asistente sabe cuál es ("¿lo tienen en M?").
  const { pathname } = useLocation()
  const productSlug = matchPath(paths.product(':slug'), pathname)?.params.slug

  if (!status?.enabled) return null

  const isChatOpen = isOpen(PANELS.CHAT)

  return (
    <>
      <button
        type="button"
        className="chat-launcher"
        aria-haspopup="dialog"
        aria-expanded={isChatOpen}
        aria-controls={CHAT_DRAWER_ID}
        onClick={() => open(PANELS.CHAT)}
      >
        <Icon name="chat" />
        <span className="chat-launcher__label">¿Te ayudamos?</span>
      </button>
      <ChatPanel
        open={isChatOpen}
        onClose={close}
        whatsapp={status.whatsapp}
        productSlug={productSlug}
        {...conversation}
      />
    </>
  )
}

function ChatPanel({ open, onClose, whatsapp, productSlug, messages, send, isSending, blocked }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const endRef = useRef(null)
  const inputId = useId()
  const counterId = useId()

  // Cada mensaje nuevo queda a la vista.
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length, isSending])

  const submit = (text) => {
    if (!text.trim() || isSending || blocked) return
    send(text, { productSlug })
    setDraft('')
  }

  const handleKeyDown = (event) => {
    // Enter envía; Shift + Enter hace un salto de línea.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit(draft)
    }
  }

  const showCounter = draft.length >= COUNTER_FROM

  return (
    <Drawer
      id={CHAT_DRAWER_ID}
      className="chat-panel"
      open={open}
      onClose={onClose}
      title="Asistente de compras"
      initialFocusRef={inputRef}
      footer={
        <form
          className="chat-panel__form"
          onSubmit={(event) => {
            event.preventDefault()
            submit(draft)
          }}
        >
          <label className="chat-panel__label" htmlFor={inputId}>
            Escribe tu pregunta
          </label>
          <div className="chat-panel__compose">
            <textarea
              ref={inputRef}
              id={inputId}
              className="chat-panel__input"
              rows={2}
              maxLength={MAX_MESSAGE_LENGTH}
              value={draft}
              disabled={blocked}
              placeholder={
                blocked ? 'El asistente está en pausa por hoy' : 'Ej.: ¿tienen jeans en talla 32?'
              }
              aria-describedby={showCounter ? counterId : undefined}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="submit" loading={isSending} disabled={blocked || !draft.trim()}>
              Enviar
            </Button>
          </div>
          {showCounter && (
            <p className="chat-panel__counter" id={counterId}>
              Te quedan {MAX_MESSAGE_LENGTH - draft.length} caracteres.
            </p>
          )}
          {whatsapp && (
            <a
              className="chat-panel__advisor"
              href={whatsappUrl(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="user" size="sm" />
              Hablar con un asesor
              <span className="chat-panel__sr"> por WhatsApp (abre en otra pestaña)</span>
            </a>
          )}
          <p className="chat-panel__disclaimer">
            Respuestas generadas con IA: pueden tener errores. No compartas datos personales ni de
            pago.
          </p>
        </form>
      }
    >
      {messages.length === 0 && (
        <div className="chat-panel__intro">
          <p>
            Hola, soy el asistente de Trama. Te ayudo con productos, tallas, precios, envíos y
            compras por mayor.
          </p>
          <ul className="chat-panel__suggestions" aria-label="Preguntas sugeridas">
            {(productSlug ? [PRODUCT_SUGGESTION, ...SUGGESTIONS.slice(1)] : SUGGESTIONS).map(
              (suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="chat-panel__suggestion"
                    disabled={isSending || blocked}
                    onClick={() => submit(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      <ol className="chat-panel__messages" role="log" aria-live="polite" aria-label="Conversación">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} whatsapp={whatsapp} />
        ))}
      </ol>
      {isSending && (
        <div className="chat-panel__typing">
          <Spinner size="sm" label="El asistente está escribiendo…" />
        </div>
      )}
      <div ref={endRef} />
    </Drawer>
  )
}
