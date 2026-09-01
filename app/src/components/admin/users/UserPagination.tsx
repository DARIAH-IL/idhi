import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { isRtlLanguage } from '@/i18n'
import { useUIStore } from '@/stores/ui'
import { ADMIN_USERS_PAGE_SIZE } from '../config'

export function UserPagination({
  page,
  totalPages,
  totalUsers,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalUsers: number
  onPageChange: (page: number) => void
}) {
  const { t } = useTranslation()
  const isRtl = isRtlLanguage(useUIStore((state) => state.language))
  const previousIcon = isRtl ? ArrowRight01Icon : ArrowLeft01Icon
  const nextIcon = isRtl ? ArrowLeft01Icon : ArrowRight01Icon

  if (totalPages === 1) {
    return (
      <div className="border-t px-4 pt-4">
        <p className="text-xs text-muted-foreground">
          {t('common.pagination.listed', { count: totalUsers })}
        </p>
      </div>
    )
  }

  return (
    <nav
      aria-label={t('common.pagination.label')}
      className="flex items-center justify-between gap-3 border-t px-4 pt-4"
    >
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {t('common.pagination.range', {
          start: page * ADMIN_USERS_PAGE_SIZE + 1,
          end: Math.min((page + 1) * ADMIN_USERS_PAGE_SIZE, totalUsers),
          total: totalUsers,
        })}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label={t('common.pagination.previous_page')}
          isDisabled={page === 0}
          onPress={() => onPageChange(Math.max(0, page - 1))}
        >
          <HugeiconsIcon
            icon={previousIcon}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
        <span className="flex min-w-16 items-center justify-center text-xs tabular-nums">
          {t('common.pagination.page_count', {
            page: page + 1,
            total: totalPages,
          })}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('common.pagination.next_page')}
          isDisabled={page + 1 >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <HugeiconsIcon icon={nextIcon} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
