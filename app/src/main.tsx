import './i18n/index.ts'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryParamProvider } from 'use-query-params'
import type { QueryParamAdapterComponent } from 'use-query-params'
import { subscribeToAuthStorage } from '@/stores/auth'
import { useEffect } from 'react'
import { useLanguageQueryParam } from '@/hooks/useLanguageQueryParam'
import { useAuthLinkQueryParams } from '@/hooks/useAuthLinkQueryParams'
import { getRouter } from './router'

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

function App() {
  useEffect(() => subscribeToAuthStorage(), [])
  useLanguageQueryParam()
  useAuthLinkQueryParams()

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
