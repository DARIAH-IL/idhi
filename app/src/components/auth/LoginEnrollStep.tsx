import { FingerPrintIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface LoginEnrollStepProps {
  busy: boolean
  error: string | null
  onCreate: () => void
  onNotNow: () => void
}

export function LoginEnrollStep({
  busy,
  error,
  onCreate,
  onNotNow,
}: LoginEnrollStepProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 px-16">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={FingerPrintIcon} size={32} strokeWidth={1.5} />
      </span>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
      <Button className="w-full" size="lg" isDisabled={busy} onPress={onCreate}>
        <HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} />
        {busy ? t('common.loading') : t('auth.passkey_create')}
      </Button>
      <Button variant="ghost" size="sm" isDisabled={busy} onPress={onNotNow}>
        {t('auth.passkey_not_now')}
      </Button>
    </div>
  )
}
