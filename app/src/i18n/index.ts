import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import he from './locales/he.json'
import ar from './locales/ar.json'
import { useUIStore } from '@/stores/ui'
import type { UiLanguage } from '@/api/models'

he satisfies typeof en
ar satisfies typeof en

const RTL_LANGUAGES: UiLanguage[] = ['he', 'ar']

export function isRtlLanguage(language: UiLanguage) {
  return RTL_LANGUAGES.includes(language)
}

i18n.use(initReactI18next).init({
  lng: useUIStore.getState().language,
  fallbackLng: 'en',
  nsSeparator: false,
  returnEmptyString: false,
  resources: {
    en: { translation: en },
    he: { translation: he },
    ar: { translation: ar },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
