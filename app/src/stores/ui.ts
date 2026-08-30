import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UiLanguage } from '@/api/models'
import { useStorageSync } from '@/hooks/useStorageSync'

interface UIState {
  language: UiLanguage
  setLanguage: (lang: UiLanguage) => void
  auditCollapsed: boolean
  setAuditCollapsed: (collapsed: boolean) => void
}

const UI_STORAGE_KEY = 'idhi-ui'
const SUPPORTED_LANGUAGES: UiLanguage[] = ['en', 'he', 'ar']

function detectBrowserLanguage(): UiLanguage {
  for (const locale of navigator.languages ?? [navigator.language]) {
    const primary = locale.split('-')[0].toLowerCase() as UiLanguage
    if (SUPPORTED_LANGUAGES.includes(primary)) {
      return primary
    }
  }
  return 'en'
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: detectBrowserLanguage(),
      setLanguage: (language) => set({ language }),
      auditCollapsed: false,
      setAuditCollapsed: (auditCollapsed) => set({ auditCollapsed }),
    }),
    { name: UI_STORAGE_KEY },
  ),
)

export function useUIStorageSync() {
  useStorageSync(useUIStore, () =>
    useUIStore.getState().setLanguage(detectBrowserLanguage()),
  )
}
