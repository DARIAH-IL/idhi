import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UiLanguage } from '@/api/models'

interface UIState {
  language: UiLanguage
  setLanguage: (lang: UiLanguage) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'idhi-ui' },
  ),
)
