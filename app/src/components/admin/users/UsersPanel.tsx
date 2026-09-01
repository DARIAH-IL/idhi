import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Add01Icon, UserMultipleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getListUsersQueryKey,
  useDeleteUserById,
  useListUsers,
} from '@/api/hooks/user-management/user-management'
import type { User } from '@/api/models'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '../ConfirmDialog'
import { ADMIN_USERS_PAGE_SIZE } from '../config'
import { UserDialog } from './UserDialog'
import { UserPagination } from './UserPagination'
import { UsersTable } from './UsersTable'

export function UsersPanel() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [userDialog, setUserDialog] = useState<User | 'new' | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const users = useListUsers({
    page,
    pageSize: ADMIN_USERS_PAGE_SIZE,
  })
  const totalUsers = users.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PAGE_SIZE))

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={UserMultipleIcon}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <h2>{t('admin.users.title')}</h2>
            <Badge variant="secondary">
              {users.isPending ? '…' : totalUsers}
            </Badge>
          </CardTitle>
          <CardDescription>{t('admin.users.description')}</CardDescription>
          <CardAction>
            <Button onPress={() => setUserDialog('new')}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                aria-hidden="true"
              />
              {t('admin.users.add')}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <UsersTable
            users={users.data?.results ?? []}
            isPending={users.isPending}
            isError={users.isError}
            onRetry={() => void users.refetch()}
            onEdit={setUserDialog}
            onDelete={setDeleteUser}
          />
        </CardContent>
        {!users.isPending && !users.isError && totalUsers > 0 && (
          <UserPagination
            page={page}
            totalPages={totalPages}
            totalUsers={totalUsers}
            onPageChange={setPage}
          />
        )}
      </Card>

      {userDialog && (
        <UserDialog
          user={userDialog === 'new' ? undefined : userDialog}
          onClose={() => setUserDialog(null)}
        />
      )}
      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
        />
      )}
    </>
  )
}

function DeleteUserDialog({
  user,
  onClose,
}: {
  user: User
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useDeleteUserById({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListUsersQueryKey(),
        })
        toast.success(t('admin.notifications.user_deleted'))
        onClose()
      },
    },
  })

  return (
    <ConfirmDialog
      title={t('admin.users.delete_title')}
      description={t('admin.users.delete_description', { email: user.email })}
      action={t('admin.users.delete_action')}
      isPending={mutation.isPending}
      onConfirm={() => mutation.mutate({ userId: user.id })}
      onClose={onClose}
    />
  )
}
