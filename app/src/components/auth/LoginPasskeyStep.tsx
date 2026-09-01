import { FingerPrintIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface LoginPasskeyStepProps {
  email: string
  passkeyBusy: boolean
  emailBusy: boolean
  error: string | null
  onSignIn: () => void
  onUseEmail: () => void
  onChangeEmail: () => void
}

export function LoginPasskeyStep({
  email,
  passkeyBusy,
  emailBusy,
  error,
  onSignIn,
  onUseEmail,
  onChangeEmail,
}: LoginPasskeyStepProps) {
  const { t } = useTranslation()
  const busy = passkeyBusy || emailBusy

  return (
    <div className="flex flex-col gap-4 px-16">
      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-sm font-medium">{email}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 font-normal text-muted-foreground"
          isDisabled={busy}
          onPress={onChangeEmail}
        >
          {t('auth.use_different_account')}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" size="lg" isDisabled={busy} onPress={onSignIn}>
        <HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} aria-hidden="true" />
        {passkeyBusy ? t('common.loading') : t('auth.passkey_login')}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        size="lg"
        isDisabled={busy}
        onPress={onUseEmail}
      >
        {emailBusy ? t('common.loading') : t('auth.sign_in_with_otp')}
      </Button>
    </div>
  )
}
