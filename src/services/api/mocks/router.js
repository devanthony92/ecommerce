// Enrutador mínimo para el backend simulado: "GET /orders/:id".

function compile(path) {
  const keys = []
  const pattern = path.replace(/:(\w+)/g, (_, key) => {
    keys.push(key)
    return '([^/]+)'
  })
  return { regex: new RegExp(`^${pattern}/?$`), keys }
}

export function defineRoutes(table) {
  return Object.entries(table).map(([signature, handler]) => {
    const [method, path] = signature.split(' ')
    return { method, ...compile(path), handler }
  })
}

export function matchRoute(routes, method, path) {
  for (const route of routes) {
    if (route.method !== method) continue
    const found = route.regex.exec(path)
    if (!found) continue
    const params = Object.fromEntries(
      route.keys.map((key, i) => [key, decodeURIComponent(found[i + 1])]),
    )
    return { handler: route.handler, params }
  }
  return null
}

// Helpers de respuesta para los handlers.
export const ok = (data, status = 200) => ({ status, data })

export const fail = (status, code, message, details) => ({
  status,
  data: { error: { code, message, ...(details && { details }) } },
})

export const requireUser = (user) =>
  user ? null : fail(401, 'UNAUTHORIZED', 'Debes iniciar sesión.')
