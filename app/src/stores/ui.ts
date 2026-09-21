import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UiLanguage } from '@/api/models'
import { useStorageSync } from '@/hooks/useStorageSync'

interface UIState {
  language: UiLanguage
  setLanguage: (lang: UiLanguage) => void
  auditCollapsed: boolean
  setAuditCollapsed: (collapsed: boolean) => void
  collapsedFacets: Record<string, boolean>
  toggleFacetCollapsed: (facetKey: string) => void
  advancedSearchCollapsed: boolean
  setAdvancedSearchCollapsed: (collapsed: boolean) => void
  backgroundMotionPaused: boolean
  setBackgroundMotionPaused: (paused: boolean) => void
}

const UI_STORAGE_KEY = 'idhi-ui'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function detectBrowserLanguage(): UiLanguage {
  for (const locale of navigator.languages) {
    const primary = (locale.split('-')[0] ?? locale).toLowerCase()
    const match = Object.values(UiLanguage).find((lang) => lang === primary)
    if (match) {
      return match
    }
  }
  return UiLanguage.en
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: detectBrowserLanguage(),
      setLanguage: (language) => set({ language }),
      auditCollapsed: false,
      setAuditCollapsed: (auditCollapsed) => set({ auditCollapsed }),
      collapsedFacets: {},
      toggleFacetCollapsed: (facetKey) =>
        set((state) => ({
          collapsedFacets: {
            ...state.collapsedFacets,
            [facetKey]: !state.collapsedFacets[facetKey],
          },
        })),
      advancedSearchCollapsed: true,
      setAdvancedSearchCollapsed: (advancedSearchCollapsed) =>
        set({ advancedSearchCollapsed }),
      backgroundMotionPaused: prefersReducedMotion(),
      setBackgroundMotionPaused: (backgroundMotionPaused) =>
        set({ backgroundMotionPaused }),
    }),
    { name: UI_STORAGE_KEY },
  ),
)

export function useUIStorageSync() {
  useStorageSync(useUIStore, () =>
    useUIStore.getState().setLanguage(detectBrowserLanguage()),
  )
}
