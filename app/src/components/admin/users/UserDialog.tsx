import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Checkbox } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getListUsersQueryKey,
  useCreateUser,
  useReplaceUserById,
} from '@/api/hooks/user-management/user-management'
import type { User, UserWrite } from '@/api/models'
import { getApiErrorMessage } from '@/lib/api-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function UserDialog({
  user,
  onClose,
}: {
  user?: User
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin ?? false)
  const [error, setError] = useState<string | null>(null)
  const finish = () => {
    void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
    toast.success(
      t(
        user
          ? 'admin.notifications.user_updated'
          : 'admin.notifications.user_created',
      ),
    )
    onClose()
  }
  const onError = (err: unknown) => setError(getApiErrorMessage(err))
  const create = useCreateUser({ mutation: { onSuccess: finish, onError } })
  const update = useReplaceUserById({
    mutation: { onSuccess: finish, onError },
  })
  const isPending = create.isPending || update.isPending

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const data: UserWrite = {
      email: email.trim(),
      isAdmin,
      ...(name.trim() ? { name: name.trim() } : {}),
    }

    if (user) {
      update.mutate({ userId: user.id, data })
    } else {
      create.mutate({ data })
    }
  }

  return (
    <Dialog
      isOpen
      onOpenChange={(open) => !open && onClose()}
      className="sm:max-w-md"
    >
      <form onSubmit={submit} className="contents">
        <DialogHeader>
          <DialogTitle>
            {t(user ? 'admin.users.edit_title' : 'admin.users.add_title')}
          </DialogTitle>
          <DialogDescription>
            {t(
              user
                ? 'admin.users.edit_description'
                : 'admin.users.add_description',
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="user-name">{t('admin.fields.name')}</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="user-email">{t('admin.fields.email')}</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <AdminAccessCheckbox isSelected={isAdmin} onChange={setIsAdmin} />
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose>{t('common.cancel')}</DialogClose>
          <Button type="submit" isDisabled={isPending}>
            {isPending
              ? t('common.loading')
              : t(user ? 'common.save' : 'admin.users.create')}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

function AdminAccessCheckbox({
  isSelected,
  onChange,
}: {
  isSelected: boolean
  onChange: (selected: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <Checkbox
      isSelected={isSelected}
      onChange={onChange}
      className="flex cursor-pointer items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {({ isSelected: selected }) => (
        <>
          <span
            className={`flex size-4 items-center justify-center rounded border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            {selected && (
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2.5}
                className="size-3"
                aria-hidden="true"
              />
            )}
          </span>
          <span>
            <span className="block text-xs font-medium">
              {t('admin.fields.admin_access')}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t('admin.fields.admin_access_description')}
            </span>
          </span>
        </>
      )}
    </Checkbox>
  )
}
