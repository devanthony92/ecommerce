import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthContext, authApi, authKeys } from '@/features/auth'
import { setUnauthorizedHandler } from '@/services/api/interceptors'
import { storage, STORAGE_KEYS } from '@/services/storage/storage'
import { SESSION_STATUS } from '@/constants/statuses'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.token))

  const meQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
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
      return user
    },
    [queryClient, dropUserScopedQueries],
  )

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession],
  )

  const register = useCallback(
    async (data) => startSession(await authApi.register(data)),
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    setUnauthorizedHandler(clearSession)
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const user = token ? (meQuery.data ?? null) : null

  let status = SESSION_STATUS.ANONYMOUS
  if (user) status = SESSION_STATUS.AUTHENTICATED
  else if (token && meQuery.isPending) status = SESSION_STATUS.UNKNOWN

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === SESSION_STATUS.AUTHENTICATED,
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
