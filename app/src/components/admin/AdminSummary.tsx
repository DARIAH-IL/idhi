import { MailOpenIcon, UserMultipleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { useGetApiV1Users } from '@/api/hooks/user-management/user-management'
import { useGetApiV1UsersInvites } from '@/api/hooks/user-invites/user-invites'
import { Card } from '@/components/ui/card'
import { ADMIN_USERS_PAGE_SIZE } from './config'

export function AdminSummary() {
  const { t } = useTranslation()
  const users = useGetApiV1Users({ page: 0, pageSize: ADMIN_USERS_PAGE_SIZE })
  const invites = useGetApiV1UsersInvites()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard
        icon={UserMultipleIcon}
        label={t('admin.users.total')}
        value={users.isPending ? '…' : String(users.data?.total ?? 0)}
      />
      <SummaryCard
        icon={MailOpenIcon}
        label={t('admin.invites.pending')}
        value={invites.isPending ? '…' : String(invites.data?.length ?? 0)}
      />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]['icon']
  label: string
  value: string
}) {
  return (
    <Card size="sm" className="flex-row items-center">
      <div className="ms-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
