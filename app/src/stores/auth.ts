import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Sentry from '@sentry/react'

import type { User } from '@/api/models'
import { useStorageSync } from '@/hooks/useStorageSync'
import { userFromToken } from '#/lib/token.ts'

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  logout: () => void
}

type PersistedAuthState = Pick<AuthState, 'token' | 'user'>

const AUTH_STORAGE_KEY = 'idhi-auth'

function sessionFromToken(token: string): PersistedAuthState {
  const user = userFromToken(token)
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    })
    return { token, user }
  } else {
    Sentry.setUser(null)
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set(sessionFromToken(token)),
      logout: () => {
        Sentry.setUser(null)
        set({ token: null, user: null })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
)

export function useAuthStorageSync() {
  useStorageSync(useAuthStore, () => useAuthStore.getState().logout())
}
