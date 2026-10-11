// Solicitudes a nuestro back-end (ecommerce-backend) para autorización e
// inspiraciones guardadas. Usa el cliente común, que agrega el JWT guardado en
// localStorage y convierte los errores en ApiError con el mensaje del servidor.
import { http } from '@/services/api/apiClient'

// Registro: { name, email, password } → { id, email, name }. No inicia sesión.
export const signup = ({ name, email, password }) => http.post('/signup', { name, email, password })

// Inicio de sesión: { email, password } → { token }.
export const signin = ({ email, password }) => http.post('/signin', { email, password })

// Usuario del token actual (correo, nombre, rol y permisos).
export const getCurrentUser = () => http.get('/users/me')

// Fotos de Pexels guardadas por el usuario, de la más reciente a la más antigua.
export const getInspirations = () => http.get('/inspirations')

export const saveInspiration = (photo) =>
  http.post('/inspirations', {
    keyword: photo.keyword,
    pexelsId: photo.id,
    alt: photo.alt,
    photographer: photo.photographer,
    photographerUrl: photo.photographerUrl,
    link: photo.url,
    image: photo.src,
  })

export const deleteInspiration = (id) => http.delete(`/inspirations/${encodeURIComponent(id)}`)
