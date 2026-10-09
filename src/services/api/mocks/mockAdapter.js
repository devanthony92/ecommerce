// Backend simulado. Implementa el contrato de docs/ARCHITECTURE.md §7.
// Se borra completo cuando exista el backend real.
import { AxiosError } from 'axios'
import { routes } from './routes'
import { matchRoute } from './router'
import { getUserFromToken } from './db'

const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 350

const STATUS_TEXT = { 200: 'OK', 201: 'Created', 204: 'No Content' }

function parseBody(data) {
  if (typeof data !== 'string') return data ?? null
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function getPath(config) {
  const url = new URL(config.url, 'http://mock')
  const base = new URL(config.baseURL ?? '/', 'http://mock').pathname.replace(/\/$/, '')
  const path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname
  return { path: path || '/', searchParams: url.searchParams }
}

function getToken(config) {
  const header = config.headers?.Authorization ?? config.headers?.authorization
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

export async function mockAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

  const method = config.method.toUpperCase()
  const { path, searchParams } = getPath(config)
  const query = { ...Object.fromEntries(searchParams), ...config.params }
  const match = matchRoute(routes, method, path)

  let result
  if (!match) {
    result = {
      status: 404,
      data: { error: { code: 'NOT_FOUND', message: `Mock sin ruta: ${method} ${path}` } },
    }
  } else {
    try {
      result = await match.handler({
        params: match.params,
        query,
        body: parseBody(config.data),
        user: getUserFromToken(getToken(config)),
      })
    } catch (err) {
      console.error('[mock]', err)
      result = {
        status: 500,
        data: { error: { code: 'INTERNAL_ERROR', message: 'Error del mock' } },
      }
    }
  }

  const response = {
    data: result.data ?? null,
    status: result.status,
    statusText: STATUS_TEXT[result.status] ?? '',
    headers: {},
    config,
    request: {},
  }

  if (result.status >= 200 && result.status < 300) return response

  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    response.request,
    response,
  )
}
