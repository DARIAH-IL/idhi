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
import { UiLanguage } from '@/api/models'
import { useUIStore } from '@/stores/ui'
import { useInviteStore } from '@/stores/invite'
import { getRouter } from './router'

const LANGUAGE_QUERY_PARAM = 'lang'
const CHALLENGE_ID_QUERY_PARAM = 'challengeId'
const OTP_QUERY_PARAM = 'otp'

const router = getRouter()

const _initialUrl = new URL(window.location.href)
const _challengeId = _initialUrl.searchParams.get(CHALLENGE_ID_QUERY_PARAM)
const _otp = _initialUrl.searchParams.get(OTP_QUERY_PARAM)
if (_challengeId && _otp) {
  useInviteStore.getState().set({ challengeId: _challengeId, otp: _otp })
}

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

function isLanguage(value: string): value is UiLanguage {
  return Object.values(UiLanguage).includes(value as UiLanguage)
}

function App() {
  const [language, setLanguageQueryParam] = useQueryParam(
    LANGUAGE_QUERY_PARAM,
    StringParam,
  )
  const [challengeId, setChallengeIdQueryParam] = useQueryParam(
    CHALLENGE_ID_QUERY_PARAM,
    StringParam,
  )
  const [otp, setOtpQueryParam] = useQueryParam(OTP_QUERY_PARAM, StringParam)
  const setLanguage = useUIStore((state) => state.setLanguage)

  useEffect(() => {
    if (language == null) return

    if (isLanguage(language)) setLanguage(language)
    setLanguageQueryParam(undefined, 'replaceIn')
  }, [language, setLanguage, setLanguageQueryParam])

  useEffect(() => {
    if (!challengeId || !otp) return
    setChallengeIdQueryParam(undefined, 'replaceIn')
    setOtpQueryParam(undefined, 'replaceIn')
  }, [challengeId, otp, setChallengeIdQueryParam, setOtpQueryParam])

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
