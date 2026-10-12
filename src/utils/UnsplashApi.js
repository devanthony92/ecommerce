// Cliente de Unsplash (API de terceros) con fetch() nativo. No usa apiClient:
// ese cliente es solo para el backend propio (token, interceptores, mocks).
// Docs: https://unsplash.com/documentation

const BASE_URL = 'https://api.unsplash.com'
// Máximo que permite Unsplash por página. Se pide todo de una vez y la UI lo
// muestra de a poco ("Mostrar más").
const PER_PAGE = 30
// Las directrices de Unsplash piden enlazar con estos parámetros.
const UTM = 'utm_source=trama&utm_medium=referral'

export const UNSPLASH_URL = `https://unsplash.com/?${UTM}`

const withUtm = (url) => `${url}${url.includes('?') ? '&' : '?'}${UTM}`

// Unsplash redimensiona y recomprime en su CDN (AVIF/WebP según el navegador).
// Tarjeta vertical 2:3: ~175 KB a 480 px frente a 2,3 MB de la foto original.
const imageUrl = (raw, width) => `${raw}&w=${width}&h=${width * 1.5}&fit=crop&auto=format&q=60`

function toPhoto(photo) {
  return {
    id: photo.id,
    alt: photo.alt_description || photo.description || `Foto de ${photo.user.name}`,
    url: withUtm(photo.links.html),
    photographer: photo.user.name,
    photographerUrl: withUtm(photo.user.links.html),
    color: photo.color,
    // Unsplash exige mostrar sus URLs (hotlinking). `src` es la versión que se
    // guarda; `srcSet` deja que pantallas densas pidan 800 px y móviles 480 px.
    src: imageUrl(photo.urls.raw, 480),
    srcSet: `${imageUrl(photo.urls.raw, 480)} 480w, ${imageUrl(photo.urls.raw, 800)} 800w`,
  }
}

/**
 * Busca fotos verticales (las de moda suelen serlo) por palabra clave.
 * Devuelve Photo[]; lanza Error si falta la clave o la respuesta no es 2xx.
 */
export async function searchPhotos(query) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!accessKey) throw new Error('Falta VITE_UNSPLASH_ACCESS_KEY en el entorno.')

  const params = new URLSearchParams({
    query,
    per_page: String(PER_PAGE),
    orientation: 'portrait',
    lang: 'es',
  })
  const response = await fetch(`${BASE_URL}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' },
  })
  if (!response.ok) throw new Error(`Unsplash respondió ${response.status}.`)

  const data = await response.json()
  return data.results.map(toPhoto)
}
