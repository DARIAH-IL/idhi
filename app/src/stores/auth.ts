import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  return user ? { token, user } : { token: null, user: null }
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set(sessionFromToken(token)),
      logout: () => set({ token: null, user: null }),
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
