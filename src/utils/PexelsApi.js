// Cliente de Pexels (API de terceros) con fetch() nativo. No usa apiClient:
// ese cliente es solo para el backend propio (token, interceptores, mocks).
// Docs: https://www.pexels.com/api/documentation/

const BASE_URL = 'https://api.pexels.com/v1'
// Máximo que permite Pexels por página. Se pide todo de una vez y la UI lo
// muestra de a poco ("Mostrar más").
const PER_PAGE = 30

function toPhoto(photo) {
  return {
    id: photo.id,
    alt: photo.alt || `Foto de ${photo.photographer}`,
    url: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    color: photo.avg_color,
    src: photo.src.portrait,
  }
}

/**
 * Busca fotos verticales (las de moda suelen serlo) por palabra clave.
 * Devuelve Photo[]; lanza Error si falta la clave o la respuesta no es 2xx.
 */
export async function searchPhotos(query) {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY
  if (!apiKey) throw new Error('Falta VITE_PEXELS_API_KEY en el entorno.')

  const params = new URLSearchParams({
    query,
    per_page: String(PER_PAGE),
    orientation: 'portrait',
    locale: 'es-ES',
  })
  const response = await fetch(`${BASE_URL}/search?${params}`, {
    headers: { Authorization: apiKey },
  })
  if (!response.ok) throw new Error(`Pexels respondió ${response.status}.`)

  const data = await response.json()
  return data.photos.map(toPhoto)
}
