import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '../api/chatApi'

export const MAX_MESSAGE_LENGTH = 500
// Solo los últimos turnos viajan al backend: cada pregunta gasta pocos tokens.
const MAX_HISTORY = 6
// Lo que se conserva al recargar: suficiente para retomar, sin crecer sin fin.
const MAX_STORED = 30
const STORAGE_KEY = 'trama.chat'

// Topes que no se liberan en minutos: el chat queda en pausa hasta recargar, porque
// insistir no sirve. Los topes por minuto (CHAT_RATE_LIMITED, CHAT_BUSY) no bloquean.
const BLOCKING_CODES = new Set(['CHAT_DAILY_LIMIT', 'CHAT_QUOTA_EXHAUSTED', 'CHAT_DISABLED'])

function errorText(error) {
  // Los 503 del asistente traen un mensaje pensado para la persona.
  if (error.code?.startsWith('CHAT_')) return error.message
  return error.userMessage
}

// sessionStorage: la conversación sobrevive a una recarga, pero se borra al cerrar la
// pestaña y nunca sale del navegador. Puede no existir o lanzar (modo privado).
function loadMessages() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveMessages(messages) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
  } catch {
    // Sin persistencia: el chat sigue funcionando en memoria.
  }
}

/**
 * Conversación del asistente. No se guarda en el servidor.
 * Cada mensaje: { id, role: 'user' | 'model', text, products?, failed?, code? }
 */
export function useChatConversation() {
  const [messages, setMessages] = useState(loadMessages)
  const [blocked, setBlocked] = useState(false)
  const nextId = useRef(messages.reduce((max, message) => Math.max(max, message.id), 0))
  const mutation = useMutation({ mutationFn: chatApi.send })
  const { mutate, isPending } = mutation

  useEffect(() => saveMessages(messages), [messages])

  // productSlug: ficha que el usuario está viendo, para preguntas como "¿lo tienen en M?".
  const send = useCallback(
    (rawText, { productSlug } = {}) => {
      const text = rawText.trim().slice(0, MAX_MESSAGE_LENGTH)
      if (!text || isPending || blocked) return

      // Los turnos fallidos no se reenvían como contexto.
      const history = messages
        .filter((message) => !message.failed)
        .slice(-MAX_HISTORY)
        .map(({ role, text: content }) => ({ role, text: content }))
      const userMessage = { id: ++nextId.current, role: 'user', text }
      setMessages((current) => [...current, userMessage])

      mutate(
        { message: text, history, ...(productSlug && { productSlug }) },
        {
          onSuccess: (data) =>
            setMessages((current) => [
              ...current,
              { id: ++nextId.current, role: 'model', text: data.reply, products: data.products },
            ]),
          onError: (error) => {
            if (BLOCKING_CODES.has(error.code)) setBlocked(true)
            setMessages((current) => [
              ...current.map((message) =>
                message.id === userMessage.id ? { ...message, failed: true } : message,
              ),
              {
                id: ++nextId.current,
                role: 'model',
                text: errorText(error),
                failed: true,
                code: error.code,
              },
            ])
          },
        },
      )
    },
    [messages, mutate, isPending, blocked],
  )

  return { messages, send, isSending: isPending, blocked }
}
