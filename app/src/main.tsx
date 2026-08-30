import './i18n/index.ts'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { I18nProvider } from 'react-aria-components'
import { QueryParamProvider } from 'use-query-params'
import type { QueryParamAdapterComponent } from 'use-query-params'
import type { UiLanguage } from '@/api/models'
import { useAuthStorageSync } from '@/stores/auth'
import { useUIStorageSync, useUIStore } from '@/stores/ui'
import { useLanguageQueryParam } from '@/hooks/useLanguageQueryParam'
import { useAuthLinkQueryParams } from '@/hooks/useAuthLinkQueryParams'
import { getRouter } from './router'

const router = getRouter()

const reactAriaLocales = {
  en: 'en-GB',
  he: 'he-IL',
  ar: 'ar-IL',
} satisfies Record<UiLanguage, string>

const TanStackRouterAdapter: QueryParamAdapterComponent = ({ children }) => {
  const getPath = (search: string) => {
    const { pathname, hash } = router.history.location
    return `${pathname}${search}${hash}`
  }

  return children({
    get location() {
      return router.history.location
    },
    push: ({ search, state }) => router.history.push(getPath(search), state),
    replace: ({ search, state }) =>
      router.history.replace(getPath(search), state),
  })
}

function App() {
  useAuthStorageSync()
  useUIStorageSync()
  useLanguageQueryParam()
  useAuthLinkQueryParams()
  const language = useUIStore((state) => state.language)

  return (
    <I18nProvider locale={reactAriaLocales[language]}>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryParamProvider adapter={TanStackRouterAdapter}>
      <App />
    </QueryParamProvider>,
  )
}
