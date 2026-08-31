import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useCompleteOauthAuthorization } from '@/api/hooks/oauth/oauth'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginDialog } from '@/components/auth/LoginDialog'

const oauthSearchSchema = z.object({
  response_type: z.string().catch(''),
  client_id: z.string().catch(''),
  redirect_uri: z.string().catch(''),
  code_challenge: z.string().catch(''),
  code_challenge_method: z.string().catch(''),
  state: z.string().optional().catch(undefined),
  scope: z.string().optional().catch(undefined),
  resource: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/oauth/authorize')({
  validateSearch: oauthSearchSchema,
  component: OauthAuthorizePage,
})

function isValidRequest(search: z.infer<typeof oauthSearchSchema>): boolean {
  return (
    search.response_type === 'code' &&
    !!search.client_id &&
    !!search.redirect_uri &&
    !!search.code_challenge &&
    search.code_challenge_method === 'S256'
  )
}

function deniedRedirectUrl(
  redirectUri: string,
  state: string | undefined,
): string | null {
  try {
    const url = new URL(redirectUri)
    url.searchParams.set('error', 'access_denied')
    if (state !== undefined) {
      url.searchParams.set('state', state)
    }
    return url.toString()
  } catch {
    return null
  }
}

function OauthAuthorizePage() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const user = useAuthStore((state) => state.user)
  const [loginOpen, setLoginOpen] = useState(
    () => !useAuthStore.getState().user,
  )
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const authorize = useCompleteOauthAuthorization({
    mutation: {
      onSuccess: ({ redirectUrl }) => {
        setIsRedirecting(true)
        window.location.assign(redirectUrl)
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const requestValid = isValidRequest(search)

  const approve = () => {
    setError(null)
    authorize.mutate({
      data: {
        response_type: 'code',
        client_id: search.client_id,
        redirect_uri: search.redirect_uri,
        code_challenge: search.code_challenge,
        code_challenge_method: 'S256',
        ...(search.state === undefined ? {} : { state: search.state }),
        ...(search.scope === undefined ? {} : { scope: search.scope }),
        ...(search.resource === undefined ? {} : { resource: search.resource }),
      },
    })
  }

  const deny = () => {
    const redirectUrl = deniedRedirectUrl(search.redirect_uri, search.state)
    if (redirectUrl) {
      setIsRedirecting(true)
      window.location.assign(redirectUrl)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <img src="/logo.png" alt="" className="mx-auto mb-2 h-16 w-auto" />
          <CardTitle>{t('oauth.title')}</CardTitle>
          <CardDescription>
            {requestValid ? t('oauth.description') : t('oauth.invalid_request')}
          </CardDescription>
        </CardHeader>
        {requestValid && user && (
          <>
            <CardContent className="space-y-2 text-sm">
              <p>{t('oauth.signed_in_as', { email: user.email })}</p>
              <p className="text-muted-foreground">
                {t('oauth.redirect_notice')}
              </p>
              {error && <p className="text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="justify-center gap-3">
              <Button
                onPress={approve}
                isDisabled={authorize.isPending || isRedirecting}
              >
                {isRedirecting ? t('oauth.redirecting') : t('common.approve')}
              </Button>
              <Button
                variant="ghost"
                onPress={deny}
                isDisabled={authorize.isPending || isRedirecting}
              >
                {t('common.deny')}
              </Button>
            </CardFooter>
          </>
        )}
        {requestValid && !user && (
          <CardContent className="text-sm text-muted-foreground">
            <p>{t('oauth.login_required')}</p>
            <Button className="mt-3" onPress={() => setLoginOpen(true)}>
              {t('common.login')}
            </Button>
          </CardContent>
        )}
      </Card>
      {requestValid && (
        <LoginDialog isOpen={loginOpen} onOpenChange={setLoginOpen} />
      )}
    </div>
  )
}
