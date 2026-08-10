import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'en' | 'he' | 'ar'

interface UIState {
  language: Language
  setLanguage: (lang: Language) => void
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
