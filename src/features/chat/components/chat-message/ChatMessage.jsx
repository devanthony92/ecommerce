import clsx from 'clsx'
import { formatWhatsapp, whatsappUrl } from '../../utils/whatsapp'
import { ChatProduct } from '../chat-product/ChatProduct'
import './chat-message.scss'

// El texto del modelo se muestra como texto plano (nunca como HTML).
// `whatsapp`: número de atención humana; se ofrece en los avisos de límite o de error.
export function ChatMessage({ message, whatsapp }) {
  const isUser = message.role === 'user'
  const isError = message.failed && !isUser

  return (
    <li
      className={clsx(
        'chat-message',
        isUser ? 'chat-message--user' : 'chat-message--model',
        isError && 'chat-message--error',
      )}
    >
      <p className="chat-message__bubble">
        <span className="chat-message__author">{isUser ? 'Tú: ' : 'Asistente: '}</span>
        {message.text}
        {isError && whatsapp && (
          <>
            {' '}
            Para atenderte mejor, escríbenos por WhatsApp al{' '}
            <a
              className="chat-message__whatsapp"
              href={whatsappUrl(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {formatWhatsapp(whatsapp)}
              <span className="chat-message__sr"> (abre WhatsApp en otra pestaña)</span>
            </a>
            .
          </>
        )}
      </p>

      {message.products?.length > 0 && (
        <ul className="chat-message__products" aria-label="Productos relacionados">
          {message.products.map((product) => (
            <li key={product.id}>
              <ChatProduct product={product} />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
