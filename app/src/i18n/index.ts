import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import { useUIStore } from '@/stores/ui'

i18n.use(initReactI18next).init({
  lng: useUIStore.getState().language,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
