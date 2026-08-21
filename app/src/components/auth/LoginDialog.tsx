import { useEffect, useRef, useState } from 'react'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { useTranslation } from 'react-i18next'
import {
  usePostApiV1AuthOtp,
  usePostApiV1AuthOtpChallengeId,
} from '@/api/hooks/user-auth/user-auth'
import { ErrorCode } from '@/api/models'
import { getApiErrorMessage, getApiErrorResponse } from '@/lib/api-error'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { usePasskeyStore } from '@/stores/passkey'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoginEmailStep } from '@/components/auth/LoginEmailStep'
import { LoginEnrollStep } from '@/components/auth/LoginEnrollStep'
import { LoginOtpStep } from '@/components/auth/LoginOtpStep'
import { LoginPasskeyStep } from '@/components/auth/LoginPasskeyStep'
import {
  usePasskeyEnroll,
  usePasskeyLogin,
} from '@/components/auth/usePasskeyFlows'

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  inviteParams?: { challengeId: string; otp: string } | null
}

type LoginStep = 'start' | 'email' | 'otp' | 'enroll' | 'loading'

export function LoginDialog({
  isOpen,
  onOpenChange,
  inviteParams,
}: LoginDialogProps) {
  const { t } = useTranslation()
  const setToken = useAuthStore((state) => state.setToken)
  const credentialId = usePasskeyStore((state) => state.credentialId)
  const passkeyEmail = usePasskeyStore((state) => state.email)
  const supportsPasskeys = browserSupportsWebAuthn()
  const hasPasskey = supportsPasskeys && !!credentialId && !!passkeyEmail
  const [step, setStep] = useState<LoginStep>('start')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpDigits, setOtpDigits] = useState<number | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [replacePasskey, setReplacePasskey] = useState(false)
  const isInviteMode = useRef(false)

  const reset = () => {
    setStep('start')
    setEmail('')
    setOtp('')
    setOtpDigits(null)
    setChallengeId(null)
    setError(null)
    setReplacePasskey(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const resetChallenge = () => {
    setOtp('')
    setOtpDigits(null)
    setChallengeId(null)
  }

  const passkeyLogin = usePasskeyLogin({
    onToken: (jwt) => {
      setToken(jwt)
      toast.success(t('auth.signed_in'))
      handleOpenChange(false)
    },
    onStaleCredential: (staleEmail, message) => {
      setEmail(staleEmail)
      setError(message)
      setStep('email')
    },
    onCeremonyFailure: () => setReplacePasskey(true),
    onError: setError,
  })

  const passkeyEnroll = usePasskeyEnroll({
    onEnrolled: () => handleOpenChange(false),
    onError: setError,
  })

  const startOtp = usePostApiV1AuthOtp({
    mutation: {
      onSuccess: (data) => {
        setChallengeId(data.challengeId)
        setOtpDigits(data.digits)
        setStep('otp')
        setError(null)
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const completeOtp = usePostApiV1AuthOtpChallengeId({
    mutation: {
      onSuccess: (data) => {
        isInviteMode.current = false
        setToken(data.jwt)
        if (supportsPasskeys && (!credentialId || replacePasskey)) {
          setError(null)
          setStep('enroll')
        } else {
          toast.success(t('auth.signed_in'))
          handleOpenChange(false)
        }
      },
      onError: (err) => {
        setError(getApiErrorMessage(err))
        if (isInviteMode.current) {
          isInviteMode.current = false
          resetChallenge()
          setStep('email')
        } else if (
          getApiErrorResponse(err)?.errorCode !== ErrorCode.WrongOtpCode
        ) {
          resetChallenge()
          setStep('start')
        }
      },
    },
  })

  useEffect(() => {
    if (!inviteParams) return
    isInviteMode.current = true
    setStep('loading')
    completeOtp.mutate({
      challengeId: inviteParams.challengeId,
      data: { otp: inviteParams.otp },
    })
  }, [inviteParams])

  const startEmailLogin = (loginEmail: string) => {
    const normalizedEmail = loginEmail.trim()
    if (!normalizedEmail) return

    setEmail(normalizedEmail)
    setError(null)
    startOtp.mutate({ data: { email: normalizedEmail } })
  }

  const handleEmailSubmit = () => startEmailLogin(email)

  const submitOtp = (value: string) => {
    if (value.length !== otpDigits || !challengeId || completeOtp.isPending) {
      return
    }

    setError(null)
    completeOtp.mutate({ challengeId, data: { otp: value } })
  }

  const goToEmail = () => {
    setEmail(passkeyEmail ?? '')
    setError(null)
    setStep('email')
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      className="min-h-[24.5rem] content-center px-8 text-center sm:max-w-[28.8rem]"
    >
      <DialogHeader className="items-center text-center mb-6">
        <img src="/logo.png" alt="" className="mb-2 h-20 w-auto" />
        <DialogTitle>
          {step === 'enroll'
            ? t('auth.passkey_offer_title')
            : t('common.site_name')}
        </DialogTitle>
        <DialogDescription>
          {step === 'enroll'
            ? t('auth.passkey_offer_description')
            : t('auth.description')}
        </DialogDescription>
        {step === 'otp' && (
          <DialogDescription>
            {t('auth.email_sent', { email })}
          </DialogDescription>
        )}
      </DialogHeader>

      {step === 'loading' ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : step === 'start' && hasPasskey ? (
        <LoginPasskeyStep
          email={passkeyEmail}
          passkeyBusy={passkeyLogin.busy}
          emailBusy={startOtp.isPending}
          error={error}
          onSignIn={() => {
            setReplacePasskey(false)
            setError(null)
            void passkeyLogin.login()
          }}
          onUseEmail={() => startEmailLogin(passkeyEmail)}
          onChangeEmail={goToEmail}
        />
      ) : step === 'enroll' ? (
        <LoginEnrollStep
          busy={passkeyEnroll.busy}
          error={error}
          onCreate={() => {
            setError(null)
            void passkeyEnroll.enroll(
              useAuthStore.getState().user?.email ?? email.trim(),
              replacePasskey ? (credentialId ?? undefined) : undefined,
            )
          }}
          onNotNow={() => handleOpenChange(false)}
        />
      ) : step === 'otp' && challengeId ? (
        <LoginOtpStep
          otp={otp}
          digits={otpDigits ?? 0}
          isPending={completeOtp.isPending}
          error={error}
          onOtpChange={setOtp}
          onSubmit={submitOtp}
          onBack={() => {
            resetChallenge()
            setError(null)
            setStep('email')
          }}
        />
      ) : (
        <LoginEmailStep
          email={email}
          isPending={startOtp.isPending}
          error={error}
          showPasskeyOption={hasPasskey}
          onEmailChange={setEmail}
          onSubmit={handleEmailSubmit}
          onUsePasskey={() => {
            setError(null)
            setStep('start')
          }}
        />
      )}
    </Dialog>
  )
}
