import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetApiV1UsersQueryKey,
  useDeleteApiV1UsersUserId,
  useGetApiV1Users,
} from '@/api/hooks/user-management/user-management'
import type { User } from '@/api/models'
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
  const users = useGetApiV1Users({
    page,
    pageSize: ADMIN_USERS_PAGE_SIZE,
  })
  const totalUsers = users.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PAGE_SIZE))

  return (
    <>
      <Card role="tabpanel" aria-labelledby="users-tab">
        <CardHeader className="border-b">
          <CardTitle>{t('admin.users.title')}</CardTitle>
          <CardDescription>{t('admin.users.description')}</CardDescription>
          <CardAction>
            <Button onPress={() => setUserDialog('new')}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
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
  const mutation = useDeleteApiV1UsersUserId({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getGetApiV1UsersQueryKey(),
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
