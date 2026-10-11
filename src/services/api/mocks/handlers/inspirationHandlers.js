import { getDb, save } from '../db'
import { fail, ok, requireUser } from '../router'

// Fotos de Unsplash guardadas (mismo contrato que el backend real).
const inspirationsOf = (user) => (getDb().inspirations[user.id] ??= [])

const REQUIRED = ['keyword', 'photoId', 'photographer', 'photographerUrl', 'link', 'image']

export const inspirationHandlers = {
  'GET /inspirations': ({ user }) => requireUser(user) ?? ok(inspirationsOf(user)),

  'POST /inspirations': ({ user, body }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const missing = REQUIRED.filter((field) => !body?.[field])
    if (missing.length) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Revisa los datos enviados.',
        Object.fromEntries(missing.map((field) => [field, 'Campo obligatorio.'])),
      )
    }
    const inspirations = inspirationsOf(user)
    if (inspirations.some((item) => item.photoId === body.photoId)) {
      return fail(409, 'ALREADY_SAVED', 'Ya guardaste esta foto.')
    }
    const db = getDb()
    db.inspirationSequence = (db.inspirationSequence ?? 0) + 1
    const inspiration = {
      id: db.inspirationSequence,
      keyword: body.keyword,
      photoId: body.photoId,
      alt: body.alt ?? '',
      photographer: body.photographer,
      photographerUrl: body.photographerUrl,
      link: body.link,
      image: body.image,
      createdAt: new Date().toISOString(),
    }
    inspirations.unshift(inspiration)
    save()
    return ok(inspiration, 201)
  },

  'DELETE /inspirations/:id': ({ user, params }) => {
    const unauthorized = requireUser(user)
    if (unauthorized) return unauthorized
    const db = getDb()
    const id = Number(params.id)
    const owner = Object.entries(db.inspirations).find(([, items]) =>
      items.some((item) => item.id === id),
    )
    if (!owner) return fail(404, 'NOT_FOUND', 'La inspiración no existe.')
    if (owner[0] !== user.id) {
      return fail(403, 'FORBIDDEN', 'No puedes borrar inspiraciones de otro usuario.')
    }
    const items = db.inspirations[user.id]
    const [removed] = items.splice(
      items.findIndex((item) => item.id === id),
      1,
    )
    save()
    return ok(removed)
  },
}
