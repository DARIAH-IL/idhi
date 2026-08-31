import { FingerPrintIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginEmailStepProps {
  email: string
  isPending: boolean
  error: string | null
  showPasskeyOption: boolean
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onUsePasskey: () => void
}

export function LoginEmailStep({
  email,
  isPending,
  error,
  showPasskeyOption,
  onEmailChange,
  onSubmit,
  onUsePasskey,
}: LoginEmailStepProps) {
  const { t } = useTranslation()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="flex flex-col gap-4 px-16"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email" className="justify-center">
          {t('common.labels.email')}
        </Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t('auth.email_placeholder')}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          autoFocus
          required
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" isDisabled={isPending}>
        {isPending ? t('common.loading') : t('common.continue')}
      </Button>
      {showPasskeyOption && (
        <Button variant="ghost" size="sm" onPress={onUsePasskey}>
          <HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} />
          {t('auth.passkey_use_passkey')}
        </Button>
      )}
    </form>
  )
}
