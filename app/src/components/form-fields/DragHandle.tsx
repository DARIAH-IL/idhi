import type { ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { DragDropVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

export function DragHandle({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      aria-label={t('common.reorder')}
      className={cn(
        'shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing',
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={DragDropVerticalIcon} size={16} strokeWidth={1.8} />
    </button>
  )
}
