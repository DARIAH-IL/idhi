import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UiLanguage } from '@/api/models'
import { useStorageSync } from '@/hooks/useStorageSync'

interface UIState {
  language: UiLanguage
  setLanguage: (lang: UiLanguage) => void
}

const UI_STORAGE_KEY = 'idhi-ui'

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: UI_STORAGE_KEY },
  ),
)

export function useUIStorageSync() {
  useStorageSync(useUIStore, () => useUIStore.getState().setLanguage('en'))
}
