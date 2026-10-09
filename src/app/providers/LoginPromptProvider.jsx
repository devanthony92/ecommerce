import { useCallback, useState } from 'react'
import { useToast } from '@/components/feedback'
import { LoginModal, LoginPromptContext } from '@/features/auth'

// Modal de login global. requestLogin(acción?) lo abre; al ingresar ejecuta la acción.
export function LoginPromptProvider({ children }) {
  const toast = useToast()
  const [pending, setPending] = useState(null)

  const requestLogin = useCallback((action) => setPending({ action }), [])

  function handleSuccess(user) {
    const { action } = pending
    setPending(null)
    toast.show({ tone: 'success', title: `Hola, ${user.name.split(' ')[0]}` })
    action?.()
  }

  return (
    <LoginPromptContext.Provider value={requestLogin}>
      {children}
      <LoginModal
        open={pending !== null}
        onClose={() => setPending(null)}
        onSuccess={handleSuccess}
      />
    </LoginPromptContext.Provider>
  )
}
