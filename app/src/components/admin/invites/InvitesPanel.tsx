import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MailAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetApiV1UsersInvitesQueryKey,
  useDeleteApiV1UsersInvitesInviteId,
  useGetApiV1UsersInvites,
} from '@/api/hooks/user-invites/user-invites'
import type { UserInvite } from '@/api/models'
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
import { InviteDialog } from './InviteDialog'
import { InvitesTable } from './InvitesTable'

export function InvitesPanel() {
  const { t } = useTranslation()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [revokeInvite, setRevokeInvite] = useState<UserInvite | null>(null)
  const invites = useGetApiV1UsersInvites()

  return (
    <>
      <Card role="tabpanel" aria-labelledby="invites-tab">
        <CardHeader className="border-b">
          <CardTitle>{t('admin.invites.title')}</CardTitle>
          <CardDescription>{t('admin.invites.description')}</CardDescription>
          <CardAction>
            <Button onPress={() => setInviteDialogOpen(true)}>
              <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} />
              {t('admin.invites.invite')}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <InvitesTable
            invites={invites.data ?? []}
            isPending={invites.isPending}
            isError={invites.isError}
            onRetry={() => void invites.refetch()}
            onRevoke={setRevokeInvite}
          />
        </CardContent>
      </Card>

      {inviteDialogOpen && (
        <InviteDialog onClose={() => setInviteDialogOpen(false)} />
      )}
      {revokeInvite && (
        <RevokeInviteDialog
          invite={revokeInvite}
          onClose={() => setRevokeInvite(null)}
        />
      )}
    </>
  )
}

function RevokeInviteDialog({
  invite,
  onClose,
}: {
  invite: UserInvite
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useDeleteApiV1UsersInvitesInviteId({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getGetApiV1UsersInvitesQueryKey(),
        })
        toast.success(t('admin.notifications.invite_revoked'))
        onClose()
      },
    },
  })

  return (
    <ConfirmDialog
      title={t('admin.invites.revoke_title')}
      description={t('admin.invites.revoke_description', {
        email: invite.email,
      })}
      action={t('admin.invites.revoke')}
      isPending={mutation.isPending}
      onConfirm={() => mutation.mutate({ inviteId: invite.id })}
      onClose={onClose}
    />
  )
}
