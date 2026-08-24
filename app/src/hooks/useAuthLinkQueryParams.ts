import { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import { useAuthLinkStore } from '@/stores/auth-link'
import type { AuthLinkFlow } from '@/stores/auth-link'
import { QUERY_PARAMS } from '@/lib/queryParams'

function authLinkFlow(value: string | null): AuthLinkFlow | null {
  if (value === 'invite' || value === 'otp') return value
  return value === null ? 'invite' : null
}

const initialUrl = new URL(window.location.href)
const initialChallengeId = initialUrl.searchParams.get(QUERY_PARAMS.challengeId)
const initialOtp = initialUrl.searchParams.get(QUERY_PARAMS.otp)
const initialAuthFlow = authLinkFlow(
  initialUrl.searchParams.get(QUERY_PARAMS.authFlow),
)

if (initialChallengeId && initialOtp && initialAuthFlow) {
  useAuthLinkStore.getState().set({
    challengeId: initialChallengeId,
    otp: initialOtp,
    flow: initialAuthFlow,
  })
}

export function useAuthLinkQueryParams() {
  const [challengeId, setChallengeIdQueryParam] = useQueryParam(
    QUERY_PARAMS.challengeId,
    StringParam,
  )
  const [otp, setOtpQueryParam] = useQueryParam(QUERY_PARAMS.otp, StringParam)
  const [authFlow, setAuthFlowQueryParam] = useQueryParam(
    QUERY_PARAMS.authFlow,
    StringParam,
  )

  useEffect(() => {
    if (!challengeId || !otp) {
      return
    }

    setChallengeIdQueryParam(undefined, 'replaceIn')
    setOtpQueryParam(undefined, 'replaceIn')
    if (authFlow != null) {
      setAuthFlowQueryParam(undefined, 'replaceIn')
    }
  }, [
    authFlow,
    challengeId,
    otp,
    setAuthFlowQueryParam,
    setChallengeIdQueryParam,
    setOtpQueryParam,
  ])
}
