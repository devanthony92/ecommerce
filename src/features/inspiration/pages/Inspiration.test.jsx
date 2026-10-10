import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { renderApp } from '@/test/renderApp'

// Respuesta de Pexels con `count` fotos.
function pexelsPhotos(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    url: `https://www.pexels.com/photo/${index + 1}/`,
    alt: `Look ${index + 1}`,
    photographer: `Autor ${index + 1}`,
    photographer_url: `https://www.pexels.com/@autor${index + 1}`,
    avg_color: '#8A7F72',
    src: { portrait: `https://images.pexels.com/photos/${index + 1}/portrait.jpeg` },
  }))
}

function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const okResponse = (count) => ({
  ok: true,
  status: 200,
  json: async () => ({ photos: pexelsPhotos(count) }),
})

const results = () => screen.getByRole('region', { name: /^Resultados/ })

async function searchFor(user, keyword) {
  await user.type(await screen.findByLabelText('Estilo, prenda o color'), keyword)
  await user.click(screen.getByRole('button', { name: 'Buscar fotos' }))
}

afterEach(() => vi.unstubAllGlobals())

describe('Inspiración (Pexels)', () => {
  it('sin palabra clave no busca y muestra el error', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(okResponse(3))
    renderApp('/inspiracion')

    await user.click(await screen.findByRole('button', { name: 'Buscar fotos' }))
    expect(screen.getByText('Por favor, introduzca una palabra clave')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    // Sin búsqueda no hay bloque de resultados.
    expect(screen.queryByRole('region', { name: /^Resultados/ })).not.toBeInTheDocument()
  })

  it('muestra de a tres fotos y "Mostrar más" hasta verlas todas', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(okResponse(7))
    renderApp('/inspiracion')

    await searchFor(user, 'denim')

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('https://api.pexels.com/v1/search?')
    expect(url).toContain('query=denim')
    expect(options.headers.Authorization).toBe('test-pexels-key')

    expect(await within(results()).findAllByRole('figure')).toHaveLength(3)
    expect(within(results()).getByText('Autor 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mostrar más' }))
    expect(within(results()).getAllByRole('figure')).toHaveLength(6)
    // El foco pasa a la primera foto nueva.
    expect(screen.getByRole('link', { name: /Look 4/ })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Mostrar más' }))
    expect(within(results()).getAllByRole('figure')).toHaveLength(7)
    expect(screen.queryByRole('button', { name: 'Mostrar más' })).not.toBeInTheDocument()
  })

  it('sin resultados muestra "No se ha encontrado nada"', async () => {
    const user = userEvent.setup()
    mockFetch(okResponse(0))
    renderApp('/inspiracion')

    await searchFor(user, 'zzzz')
    expect(
      await within(results()).findByRole('heading', { name: 'No se ha encontrado nada' }),
    ).toBeInTheDocument()
  })

  it('si la API falla muestra el mensaje de error', async () => {
    const user = userEvent.setup()
    mockFetch({ ok: false, status: 500, json: async () => ({}) })
    renderApp('/inspiracion')

    await searchFor(user, 'denim')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexión o que el servidor no funcione. Por favor, inténtalo más tarde',
    )
  })

  it('guarda la última búsqueda y la restaura al volver', async () => {
    const user = userEvent.setup()
    mockFetch(okResponse(4))
    const { unmount } = renderApp('/inspiracion')
    await searchFor(user, 'oficina')
    await within(results()).findAllByRole('figure')
    expect(storage.get(STORAGE_KEYS.inspiration).query).toBe('oficina')
    unmount()

    const fetchMock = mockFetch(okResponse(4))
    renderApp('/inspiracion')
    expect(
      await screen.findByRole('heading', { name: 'Resultados para “oficina”' }),
    ).toBeInTheDocument()
    expect(within(results()).getAllByRole('figure')).toHaveLength(3)
    expect(screen.getByLabelText('Estilo, prenda o color')).toHaveValue('oficina')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
