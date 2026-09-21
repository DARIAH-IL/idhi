import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export function DraftBadge({
  isDraft,
}: {
  isDraft: boolean | null | undefined
}) {
  const { t } = useTranslation()

  if (!isDraft) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    >
      {t('entity.draft_badge')}
    </Badge>
  )
}
