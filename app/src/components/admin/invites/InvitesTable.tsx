import { useTranslation } from 'react-i18next'
import type { UserInvite } from '@/api/models'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminTableError, AdminTableState } from '../AdminTableState'

export function InvitesTable({
  invites,
  isPending,
  isError,
  onRetry,
  onRevoke,
}: {
  invites: UserInvite[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onRevoke: (invite: UserInvite) => void
}) {
  const { t, i18n } = useTranslation()

  if (isPending) {
    return <AdminTableState message={t('common.loading')} />
  }
  if (isError) {
    return <AdminTableError onRetry={onRetry} />
  }
  if (invites.length === 0) {
    return <AdminTableState message={t('admin.invites.empty')} />
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))

  return (
    <Table aria-label={t('admin.invites.table_label')}>
      <TableHeader>
        <TableHead isRowHeader>{t('admin.fields.email')}</TableHead>
        <TableHead>{t('admin.fields.message')}</TableHead>
        <TableHead>{t('admin.fields.expires')}</TableHead>
        <TableHead className="w-28 text-end">
          {t('admin.fields.actions')}
        </TableHead>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id} id={invite.id}>
            <TableCell className="font-medium">{invite.email}</TableCell>
            <TableCell className="max-w-72 truncate text-muted-foreground">
              {invite.message || '—'}
            </TableCell>
            <TableCell>{formatDate(invite.expiration)}</TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onPress={() => onRevoke(invite)}
                >
                  {t('admin.invites.revoke')}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
