import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MailAdd01Icon, MailOpenIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getListUserInvitesQueryKey,
  useListUserInvites,
  useRevokeUserInviteById,
} from '@/api/hooks/user-invites/user-invites'
import type { UserInvite } from '@/api/models'
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
import { InviteDialog } from './InviteDialog'
import { InvitesTable } from './InvitesTable'

export function InvitesPanel() {
  const { t } = useTranslation()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [revokeInvite, setRevokeInvite] = useState<UserInvite | null>(null)
  const invites = useListUserInvites()

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={MailOpenIcon} strokeWidth={1.8} />
            {t('admin.invites.title')}
            <Badge variant="secondary">
              {invites.isPending ? '…' : (invites.data?.length ?? 0)}
            </Badge>
          </CardTitle>
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
  const mutation = useRevokeUserInviteById({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListUserInvitesQueryKey(),
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
