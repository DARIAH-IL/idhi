import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'

interface LoginOtpStepProps {
  otp: string
  digits: number
  isPending: boolean
  error: string | null
  onOtpChange: (otp: string) => void
  onSubmit: (otp: string) => void
  onBack: () => void
}

export function LoginOtpStep({
  otp,
  digits,
  isPending,
  error,
  onOtpChange,
  onSubmit,
  onBack,
}: LoginOtpStepProps) {
  const { t } = useTranslation()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(otp)
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-otp" className="justify-center">
          {t('auth.otp_label')}
        </Label>
        <InputOTP
          id="login-otp"
          maxLength={digits}
          pattern={REGEXP_ONLY_DIGITS}
          autoComplete="one-time-code"
          value={otp}
          onChange={onOtpChange}
          onComplete={onSubmit}
          containerClassName="justify-center"
          autoFocus
          required
        >
          <InputOTPGroup>
            {Array.from({ length: digits }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isDisabled={isPending || otp.length !== digits}
      >
        {isPending ? t('common.loading') : t('common.verify')}
      </Button>
      <Button variant="ghost" size="sm" onPress={onBack}>
        {t('auth.back_to_email')}
      </Button>
    </form>
  )
}
