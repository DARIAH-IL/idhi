import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PasskeyState {
  credentialId: string | null
  email: string | null
  setCredential: (credentialId: string, email: string) => void
  clearCredential: () => void
}

const PASSKEY_STORAGE_KEY = 'idhi-passkey'

export const usePasskeyStore = create<PasskeyState>()(
  persist(
    (set) => ({
      credentialId: null,
      email: null,
      setCredential: (credentialId, email) => set({ credentialId, email }),
      clearCredential: () => set({ credentialId: null, email: null }),
    }),
    { name: PASSKEY_STORAGE_KEY },
  ),
)
