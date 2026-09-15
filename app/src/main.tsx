import './i18n/index.ts'
import { useSyncExternalStore } from 'react'
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

import * as Sentry from '@sentry/react'

const reactAriaLocales = {
  en: 'en-GB',
  he: 'he-IL',
  ar: 'ar-IL',
} satisfies Record<UiLanguage, string>

function redirectToCanonicalHost() {
  if (window.location.hostname !== 'idhi.pages.dev') {
    return false
  }

  const { pathname, search, hash } = window.location
  window.location.replace(`https://idh-index.org${pathname}${search}${hash}`)

  return true
}

function startApp() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    enabled: import.meta.env.VITE_SENTRY_DISABLED !== 'true',
    dataCollection: {},
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      import.meta.env['VITE_SERVER_URL'] ?? 'http://localhost:8787',
    ],
  })

  const router = getRouter()

  const TanStackRouterAdapter: QueryParamAdapterComponent = ({ children }) => {
    const location = useSyncExternalStore(
      router.history.subscribe,
      () => router.history.location,
    )

    const getPath = (search: string) => {
      const { pathname, hash } = router.history.location
      return `${pathname}${search}${hash}`
    }

    return children({
      location,
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
}

if (!redirectToCanonicalHost()) {
  startApp()
}
