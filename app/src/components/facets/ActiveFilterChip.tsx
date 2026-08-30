import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Button } from '#/components/ui/button.tsx'

interface ActiveFilterChipProps {
  filterLabel: string
  onRemove: () => void
}

export function ActiveFilterChip({
  filterLabel,
  onRemove,
}: ActiveFilterChipProps) {
  const { t } = useTranslation()

  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs font-medium">
      {filterLabel}
      <Button
        size="icon-xs"
        variant="ghost"
        className="-me-1 size-4 rounded-full"
        aria-label={t('board.facets.remove_filter', { filter: filterLabel })}
        onPress={onRemove}
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} aria-hidden="true" />
      </Button>
    </span>
  )
}
