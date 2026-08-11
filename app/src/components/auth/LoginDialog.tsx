import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  usePostApiV1AuthOtp,
  usePostApiV1AuthOtpChallengeId,
} from '@/api/hooks/user-auth/user-auth'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function LoginDialog({ isOpen, onOpenChange }: LoginDialogProps) {
  const { t } = useTranslation()
  const setToken = useAuthStore((state) => state.setToken)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setEmail('')
    setOtp('')
    setChallengeId(null)
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const startOtp = usePostApiV1AuthOtp({
    mutation: {
      onSuccess: (data) => {
        setChallengeId(data.challengeId)
        setError(null)
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const completeOtp = usePostApiV1AuthOtpChallengeId({
    mutation: {
      onSuccess: (data) => {
        setToken(data.jwt)
        handleOpenChange(false)
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setError(null)
    startOtp.mutate({ data: { email: email.trim() } })
  }

  const handleOtpSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!otp.trim() || !challengeId) return
    setError(null)
    completeOtp.mutate({ challengeId, data: { otp: otp.trim() } })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      className="min-h-[24.5rem] content-center px-8 sm:max-w-[28.8rem]"
    >
      <DialogHeader className="items-center text-center mb-6">
        <img src="/logo.png" alt="" className="mb-2 h-20 w-auto" />
        <DialogTitle>{t('common.site_name')}</DialogTitle>
        <DialogDescription>{t('auth.description')}</DialogDescription>
        {challengeId && (
          <DialogDescription>
            {t('auth.email_sent', { email })}
          </DialogDescription>
        )}
      </DialogHeader>

      {!challengeId ? (
        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col gap-4 px-16"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">{t('auth.email_label')}</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.email_placeholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
              required
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
            <Label htmlFor="login-otp">{t('auth.otp_label')}</Label>
            <Input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t('auth.otp_placeholder')}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              autoFocus
              required
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
    </Dialog>
  )
}
