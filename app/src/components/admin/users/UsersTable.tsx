import { Delete04Icon, Edit03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import type { User } from '@/api/models'
import { Badge } from '@/components/ui/badge'
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

export function UsersTable({
  users,
  isPending,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: {
  users: User[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) {
  const { t } = useTranslation()

  if (isPending) {
    return <AdminTableState message={t('common.loading')} />
  }
  if (isError) {
    return <AdminTableError onRetry={onRetry} />
  }
  if (users.length === 0) {
    return <AdminTableState message={t('admin.users.empty')} />
  }

  return (
    <Table aria-label={t('admin.users.table_label')}>
      <TableHeader>
        <TableHead isRowHeader>{t('admin.fields.user')}</TableHead>
        <TableHead>{t('admin.fields.role')}</TableHead>
        <TableHead>{t('admin.fields.groups')}</TableHead>
        <TableHead className="w-28 text-end">
          {t('admin.fields.actions')}
        </TableHead>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} id={user.id}>
            <TableCell>
              <div className="min-w-44">
                <p className="font-medium">{user.email}</p>
                {user.name && (
                  <p className="text-muted-foreground">{user.name}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                {user.isAdmin ? t('admin.roles.admin') : t('admin.roles.user')}
              </Badge>
            </TableCell>
            <TableCell>
              {user.groups.length > 0 ? (
                <div className="flex min-w-32 flex-wrap gap-1">
                  {user.groups.map((group) => (
                    <Badge key={group} variant="outline">
                      {group}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">
                  {t('admin.users.no_groups')}
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('admin.users.edit_label', {
                    email: user.email,
                  })}
                  onPress={() => onEdit(user)}
                >
                  <HugeiconsIcon
                    icon={Edit03Icon}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  aria-label={t('admin.users.delete_label', {
                    email: user.email,
                  })}
                  onPress={() => onDelete(user)}
                >
                  <HugeiconsIcon
                    icon={Delete04Icon}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
