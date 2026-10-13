import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/feedback'
import { setUnauthorizedHandler } from '@/services/api/interceptors'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { paths } from '@/constants/paths'
import { SESSION_STATUS } from '@/constants/statuses'
import { getCurrentUser, signin, signup } from '@/utils/MainApi'
import { authApi } from '../api/authApi'
import { authKeys } from '../api/authKeys'

/**
 * Estado de la sesión. El token vive en localStorage; `currentUser` sale de
 * GET /users/me. App lo comparte con CurrentUserContext.Provider.
 */
export function useSession() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.token))
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])
  // Ruta desde la que se cerró sesión a propósito: esa ruta privada lleva al inicio,
  // no al login. Cualquier otra ruta privada sí pide ingresar.
  const [signedOutFrom, setSignedOutFrom] = useState(null)

  const meQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // Los precios, el carrito y casi todo dependen de quién mira:
  // al cambiar de sesión se descarta todo lo cacheado salvo auth.
  const dropUserScopedQueries = useCallback(() => {
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.all[0] })
  }, [queryClient])

  const clearSession = useCallback(() => {
    storage.remove(STORAGE_KEYS.token)
    setToken(null)
    queryClient.removeQueries({ queryKey: authKeys.all })
    dropUserScopedQueries()
  }, [queryClient, dropUserScopedQueries])

  const startSession = useCallback(
    ({ token: newToken, user }) => {
      storage.set(STORAGE_KEYS.token, newToken)
      dropUserScopedQueries()
      queryClient.setQueryData(authKeys.me(), user)
      setToken(newToken)
      setSignedOutFrom(null)
      return user
    },
    [queryClient, dropUserScopedQueries],
  )

  // Tras un cambio de rol/permisos en el backend (p. ej. cuenta mayorista aprobada):
  // se vuelve a pedir el usuario y se descartan precios, carrito y demás datos por usuario.
  const refreshSession = useCallback(async () => {
    dropUserScopedQueries()
    await queryClient.invalidateQueries({ queryKey: authKeys.me() })
  }, [queryClient, dropUserScopedQueries])

  // /signin devuelve solo el token; con él se pide el usuario a /users/me.
  const login = useCallback(
    async (credentials) => {
      const { token: newToken } = await signin(credentials)
      storage.set(STORAGE_KEYS.token, newToken)
      try {
        return startSession({ token: newToken, user: await getCurrentUser() })
      } catch (error) {
        storage.remove(STORAGE_KEYS.token)
        throw error
      }
    },
    [startSession],
  )

  // El registro no inicia sesión: después se ofrece ingresar.
  const register = useCallback((data) => signup(data), [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
      setSignedOutFrom(pathnameRef.current)
      // Desde cualquier página (pública o privada), cerrar sesión lleva al inicio.
      navigate(paths.home, { replace: true })
      toast.show({ title: 'Cerraste sesión' })
    }
  }, [clearSession, navigate, toast])

  useEffect(() => {
    // 401 en cualquier request con sesión: el token venció o fue revocado.
    setUnauthorizedHandler(() => {
      if (!storage.get(STORAGE_KEYS.token)) return
      clearSession()
      toast.show({
        tone: 'warning',
        title: 'Tu sesión expiró',
        description: 'Ingresa de nuevo para continuar.',
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession, toast])

  const currentUser = token ? (meQuery.data ?? null) : null

  let status = SESSION_STATUS.ANONYMOUS
  if (currentUser) status = SESSION_STATUS.AUTHENTICATED
  else if (token && meQuery.isPending) status = SESSION_STATUS.UNKNOWN

  return useMemo(
    () => ({
      currentUser,
      status,
      isAuthenticated: status === SESSION_STATUS.AUTHENTICATED,
      signedOutFrom,
      login,
      register,
      logout,
      refreshSession,
    }),
    [currentUser, status, signedOutFrom, login, register, logout, refreshSession],
  )
}
