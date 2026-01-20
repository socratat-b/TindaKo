import { useAuthStore } from '@/lib/stores/auth-store'
import { login, signup, logout } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useAuth() {
  const { user, isLoading, setLoading } = useAuthStore()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result?.error) {
        setLoading(false)
        throw new Error(result.error)
      }
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signup(email, password)
      if (result?.error) {
        setLoading(false)
        throw new Error(result.error)
      }
      startTransition(() => {
        router.refresh()
      })
      return result
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await logout()
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  return {
    user,
    isLoading: isLoading || isPending,
    signIn,
    signUp,
    signOut,
  }
}
