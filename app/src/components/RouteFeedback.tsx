import type { ErrorComponentProps } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function RoutePending() {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <HugeiconsIcon
        icon={Loading03Icon}
        strokeWidth={2}
        className="size-6 animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm">{t('common.loading')}</p>
    </div>
  )
}

export function RouteError({ reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const retry = () => {
    reset()
    void router.invalidate()
  }

  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <HugeiconsIcon
        icon={Alert02Icon}
        strokeWidth={2}
        className="size-8 text-destructive"
        aria-hidden="true"
      />
      <div>
        <h1 className="text-lg font-semibold">{t('common.error')}</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {t('common.route_error_description')}
        </p>
      </div>
      <Button onPress={retry}>{t('common.try_again')}</Button>
    </div>
  )
}
