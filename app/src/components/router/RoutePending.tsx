import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Loading03Icon } from '@hugeicons/core-free-icons'

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
        className="size-6 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-sm">{t('common.loading')}</p>
    </div>
  )
}
