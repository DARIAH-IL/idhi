import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterEditIcon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

interface AdvancedSearchToggleButtonProps {
  isVisible: boolean
  activeCount: number
  onToggle: () => void
}

export function AdvancedSearchToggleButton({
  isVisible,
  activeCount,
  onToggle,
}: AdvancedSearchToggleButtonProps) {
  const { t } = useTranslation()
  const isLocked = activeCount > 0
  const label = isLocked
    ? `${t('board.advanced.toggle_locked')} (${activeCount})`
    : t(isVisible ? 'board.advanced.toggle_hide' : 'board.advanced.toggle_show')

  return (
    <div className="relative hidden md:inline-flex">
      <TooltipTrigger>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          aria-expanded={isVisible}
          isDisabled={isLocked}
          onPress={onToggle}
        >
          <HugeiconsIcon
            icon={FilterEditIcon}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
        <Tooltip>{label}</Tooltip>
      </TooltipTrigger>

      {activeCount > 0 && (
        <Badge
          variant="outline"
          className="pointer-events-none absolute -end-1.5 -top-1.5"
        >
          {activeCount}
        </Badge>
      )}
    </div>
  )
}
