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
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('admin.users.edit_label', {
                    email: user.email,
                  })}
                  onPress={() => onEdit(user)}
                >
                  <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={t('admin.users.delete_label', {
                    email: user.email,
                  })}
                  onPress={() => onDelete(user)}
                >
                  <HugeiconsIcon icon={Delete04Icon} strokeWidth={2} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
