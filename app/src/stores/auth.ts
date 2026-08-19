import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '@/api/models'

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  logout: () => void
}

type PersistedAuthState = Pick<AuthState, 'token' | 'user'>

function userFromToken(token: string): User | null {
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return null

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(paddedBase64), (character) =>
      character.charCodeAt(0),
    )
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('id' in payload) ||
      typeof payload.id !== 'string' ||
      !payload.id.startsWith('idhi:user:') ||
      !('email' in payload) ||
      typeof payload.email !== 'string' ||
      !('isAdmin' in payload) ||
      typeof payload.isAdmin !== 'boolean' ||
      ('name' in payload &&
        payload.name !== undefined &&
        typeof payload.name !== 'string')
    ) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      isAdmin: payload.isAdmin,
      ...('name' in payload && typeof payload.name === 'string'
        ? { name: payload.name }
        : {}),
    }
  } catch {
    return null
  }
}

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
      name: 'idhi-auth',
      version: 1,
      partialize: ({ token, user }) => ({ token, user }),
      migrate: (persistedState) => {
        const token =
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'token' in persistedState &&
          typeof persistedState.token === 'string'
            ? persistedState.token
            : null

        return token ? sessionFromToken(token) : { token: null, user: null }
      },
    },
  ),
)
