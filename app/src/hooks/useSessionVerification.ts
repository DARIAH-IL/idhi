import { useEffect } from 'react'
import { getSession } from '@/api/hooks/user-auth/user-auth'
import { useAuthStore } from '@/stores/auth'

export function useSessionVerification() {
  useEffect(() => {
    if (!useAuthStore.getState().token) {
      return
    }

    const controller = new AbortController()
    getSession(controller.signal).catch(() => undefined)

    return () => controller.abort()
  }, [])
}
