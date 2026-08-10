import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  usePostApiV1AuthOtp,
  usePostApiV1AuthOtpChallengeId,
} from '@/api/hooks/user-auth/user-auth'
import type { ErrorResponse } from '@/api/models'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s['redirect'] === 'string' ? s['redirect'] : undefined,
  }),
  component: LoginPage,
})

function extractErrorMessage(
  err: unknown,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const axiosErr = err as AxiosError<ErrorResponse>
  const errorCode = axiosErr?.response?.data?.errorCode
  if (
    errorCode &&
    t(`auth.errors.${errorCode}`) !== `auth.errors.${errorCode}`
  ) {
    return t(`auth.errors.${errorCode}`)
  }
  return t('auth.errors.generic')
}

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const setToken = useAuthStore((s) => s.setToken)

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startOtp = usePostApiV1AuthOtp({
    mutation: {
      onSuccess: (data) => {
        setChallengeId(data.challengeId)
        setError(null)
      },
      onError: (err) => setError(extractErrorMessage(err, t)),
    },
  })

  const completeOtp = usePostApiV1AuthOtpChallengeId({
    mutation: {
      onSuccess: (data) => {
        setToken(data.jwt)
        void navigate({ to: redirect ?? '/entities', replace: true })
      },
      onError: (err) => setError(extractErrorMessage(err, t)),
    },
  })

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    startOtp.mutate({ data: { email: email.trim() } })
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || !challengeId) return
    setError(null)
    completeOtp.mutate({ challengeId, data: { otp: otp.trim() } })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('auth.title')}</CardTitle>
          {challengeId && (
            <CardDescription>{t('auth.email_sent', { email })}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!challengeId ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t('auth.email_label')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.email_placeholder')}
                  value={email}
                  onChange={setEmail}
                  isRequired
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isDisabled={startOtp.isPending}
              >
                {startOtp.isPending ? t('common.loading') : t('auth.continue')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otp">{t('auth.otp_label')}</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={t('auth.otp_placeholder')}
                  value={otp}
                  onChange={setOtp}
                  autoFocus
                  isRequired
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isDisabled={completeOtp.isPending}
              >
                {completeOtp.isPending ? t('common.loading') : t('auth.verify')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  setChallengeId(null)
                  setOtp('')
                  setError(null)
                }}
              >
                {t('auth.back_to_email')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
