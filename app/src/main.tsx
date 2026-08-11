import './i18n/index.ts'
import { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import {
  QueryParamProvider,
  StringParam,
  useQueryParam,
} from 'use-query-params'
import type { QueryParamAdapterComponent } from 'use-query-params'
import { Language } from '@/api/models'
import { useUIStore } from '@/stores/ui'
import { getRouter } from './router'

const LANGUAGE_QUERY_PARAM = 'lang'

const router = getRouter()

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

function isLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language)
}

function App() {
  const [language, setLanguageQueryParam] = useQueryParam(
    LANGUAGE_QUERY_PARAM,
    StringParam,
  )
  const setLanguage = useUIStore((state) => state.setLanguage)

  useEffect(() => {
    if (language == null) return

    if (isLanguage(language)) setLanguage(language)
    setLanguageQueryParam(undefined, 'replaceIn')
  }, [language, setLanguage, setLanguageQueryParam])

  return <RouterProvider router={router} />
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
