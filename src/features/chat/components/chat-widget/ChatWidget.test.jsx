import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '@/services/api/ApiError'
import { renderApp } from '@/test/renderApp'
import { chatApi } from '../../api/chatApi'

async function openChat(user, route = '/') {
  renderApp(route)
  await user.click(await screen.findByRole('button', { name: '¿Te ayudamos?' }))
  return screen.getByRole('dialog', { name: 'Asistente de compras' })
}

describe('Asistente de compras', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it('no aparece si el backend no tiene el asistente configurado', async () => {
    vi.spyOn(chatApi, 'status').mockResolvedValue({ enabled: false })
    renderApp('/')
    await screen.findByRole('navigation', { name: 'Categorías' })

    expect(screen.queryByRole('button', { name: '¿Te ayudamos?' })).not.toBeInTheDocument()
  })

  it('responde y muestra los productos relacionados como enlaces', async () => {
    const user = userEvent.setup()
    const chat = await openChat(user)
    const input = within(chat).getByRole('textbox', { name: 'Escribe tu pregunta' })
    expect(input).toHaveFocus()

    await user.type(input, 'camiseta{Enter}')

    const log = within(chat).getByRole('log', { name: 'Conversación' })
    expect(within(log).getByText('camiseta')).toBeInTheDocument()
    expect(await within(log).findByText(/Encontré \d+ productos?/)).toBeInTheDocument()
    const related = within(log).getByRole('list', { name: 'Productos relacionados' })
    expect(within(related).getByRole('link', { name: /Camiseta básica/ })).toHaveAttribute(
      'href',
      '/producto/camiseta-basica',
    )
    expect(input).toHaveValue('')
  })

  it('envía solo los últimos turnos como historial', async () => {
    const user = userEvent.setup()
    const send = vi.spyOn(chatApi, 'send').mockResolvedValue({ reply: 'Listo.', products: [] })
    const chat = await openChat(user)
    const input = within(chat).getByRole('textbox', { name: 'Escribe tu pregunta' })

    for (let index = 0; index < 5; index += 1) {
      await user.type(input, `pregunta ${index}{Enter}`)
      await waitFor(() => expect(send).toHaveBeenCalledTimes(index + 1))
      await within(chat).findAllByText('Listo.')
    }

    const { message, history } = send.mock.calls.at(-1)[0]
    expect(message).toBe('pregunta 4')
    expect(history).toHaveLength(6)
    expect(history.at(-1)).toEqual({ role: 'model', text: 'Listo.' })
  })

  it.each([
    [
      'CHAT_DAILY_LIMIT',
      429,
      'Llegaste al límite de preguntas de hoy. Podrás volver a preguntar mañana.',
    ],
    [
      'CHAT_QUOTA_EXHAUSTED',
      503,
      'El asistente alcanzó su límite de hoy. Vuelve a intentarlo mañana.',
    ],
  ])('con %s muestra el aviso y bloquea el envío', async (code, status, message) => {
    const user = userEvent.setup()
    vi.spyOn(chatApi, 'send').mockRejectedValue(new ApiError({ status, code, message }))
    const chat = await openChat(user)

    await user.click(within(chat).getByRole('button', { name: '¿Cuánto cuesta el envío?' }))

    expect(await within(chat).findByText(message, { exact: false })).toBeInTheDocument()
    expect(within(chat).getByRole('textbox', { name: 'Escribe tu pregunta' })).toBeDisabled()
  })

  it('el tope por minuto avisa pero deja volver a intentar', async () => {
    const user = userEvent.setup()
    const message = 'Enviaste muchas preguntas seguidas. Espera un momento y vuelve a intentarlo.'
    vi.spyOn(chatApi, 'send').mockRejectedValue(
      new ApiError({ status: 429, code: 'CHAT_RATE_LIMITED', message }),
    )
    const chat = await openChat(user)

    await user.click(within(chat).getByRole('button', { name: '¿Cuánto cuesta el envío?' }))

    expect(await within(chat).findByText(message, { exact: false })).toBeInTheDocument()
    expect(within(chat).getByRole('textbox', { name: 'Escribe tu pregunta' })).toBeEnabled()
  })

  it('en una ficha de producto envía cuál es y sugiere preguntar por él', async () => {
    const user = userEvent.setup()
    const send = vi.spyOn(chatApi, 'send').mockResolvedValue({ reply: 'Sí.', products: [] })
    const chat = await openChat(user, '/producto/camiseta-basica')

    await user.click(
      within(chat).getByRole('button', { name: '¿Qué tallas y colores hay de este producto?' }),
    )

    await waitFor(() => expect(send).toHaveBeenCalled())
    expect(send.mock.calls[0][0]).toMatchObject({ productSlug: 'camiseta-basica' })
  })

  it('agrega al carrito desde la tarjeta eligiendo color y talla', async () => {
    const user = userEvent.setup()
    const chat = await openChat(user)
    await user.type(
      within(chat).getByRole('textbox', { name: 'Escribe tu pregunta' }),
      'camiseta básica{Enter}',
    )
    const card = (await within(chat).findByRole('link', { name: /Camiseta básica/ })).closest(
      'article',
    )

    await user.click(within(card).getByRole('button', { name: 'Agregar Camiseta básica' }))
    const colorSelect = within(card).getByRole('combobox', { name: 'Color' })
    expect(colorSelect).toHaveFocus()
    const addButton = within(card).getByRole('button', { name: 'Agregar al carrito' })
    expect(addButton).toBeDisabled()

    await user.selectOptions(within(card).getByRole('combobox', { name: 'Talla' }), 'M')
    await user.click(addButton)

    expect(await screen.findByText('Agregado al carrito')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(await screen.findByRole('button', { name: 'Carrito, 1 producto' })).toBeInTheDocument()
  })

  it('ofrece un asesor por WhatsApp y lo menciona en los avisos de error', async () => {
    const user = userEvent.setup()
    vi.spyOn(chatApi, 'send').mockRejectedValue(
      new ApiError({
        status: 429,
        code: 'CHAT_RATE_LIMITED',
        message: 'Enviaste muchas preguntas seguidas.',
      }),
    )
    const chat = await openChat(user)

    const advisor = within(chat).getByRole('link', { name: /Hablar con un asesor/ })
    expect(advisor).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\/573001234567\?text=/),
    )
    expect(advisor).toHaveAttribute('target', '_blank')
    expect(advisor).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(within(chat).getByRole('button', { name: '¿Cuánto cuesta el envío?' }))

    const log = within(chat).getByRole('log', { name: 'Conversación' })
    expect(
      await within(log).findByText(/Para atenderte mejor, escríbenos por WhatsApp/),
    ).toBeInTheDocument()
    expect(within(log).getByRole('link', { name: /\+57 300 123 4567/ })).toBeInTheDocument()
  })

  it('sin número de WhatsApp no ofrece asesor', async () => {
    const user = userEvent.setup()
    vi.spyOn(chatApi, 'status').mockResolvedValue({ enabled: true, whatsapp: null })
    const chat = await openChat(user)

    expect(
      within(chat).queryByRole('link', { name: /Hablar con un asesor/ }),
    ).not.toBeInTheDocument()
  })

  it('la conversación sobrevive a una recarga de la página', async () => {
    const user = userEvent.setup()
    vi.spyOn(chatApi, 'send').mockResolvedValue({ reply: 'Tenemos 6 camisetas.', products: [] })
    const chat = await openChat(user)
    await user.click(within(chat).getByRole('button', { name: '¿Qué camisetas tienen?' }))
    await within(chat).findByText('Tenemos 6 camisetas.')

    cleanup()
    const reopened = await openChat(user)

    const log = within(reopened).getByRole('log', { name: 'Conversación' })
    expect(within(log).getByText('¿Qué camisetas tienen?')).toBeInTheDocument()
    expect(within(log).getByText('Tenemos 6 camisetas.')).toBeInTheDocument()
  })
})
