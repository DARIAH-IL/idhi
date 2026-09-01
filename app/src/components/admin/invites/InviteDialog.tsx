import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getListUserInvitesQueryKey,
  useInviteUser,
} from '@/api/hooks/user-invites/user-invites'
import { UiLanguage } from '@/api/models'
import type { UserInviteWrite } from '@/api/models'
import { getApiErrorMessage } from '@/lib/api-error'
import { languageName } from '@/lib/languages'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUIStore } from '#/stores/ui.ts'

export function InviteDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const uiLanguage = useUIStore((state) => state.language)
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [expiryDays, setExpiryDays] = useState('7')
  const [lang, setLang] = useState<UiLanguage>(uiLanguage)
  const [error, setError] = useState<string | null>(null)
  const invite = useInviteUser({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListUserInvitesQueryKey(),
        })
        toast.success(t('admin.notifications.invite_sent'))
        onClose()
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const data: UserInviteWrite = {
      email: email.trim(),
      expiryDays: Number(expiryDays),
      lang,
      ...(message.trim() ? { message: message.trim() } : {}),
    }
    invite.mutate({ data })
  }

  return (
    <Dialog
      isOpen
      onOpenChange={(open) => !open && onClose()}
      className="sm:max-w-md"
    >
      <form onSubmit={submit} className="contents">
        <DialogHeader>
          <DialogTitle>{t('admin.invites.invite_title')}</DialogTitle>
          <DialogDescription>
            {t('admin.invites.invite_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="invite-email">{t('admin.fields.email')}</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="invite-message">{t('admin.fields.message')}</Label>
            <Textarea
              id="invite-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t('admin.invites.message_placeholder')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="invite-expiry">
                {t('admin.fields.expiry_days')}
              </Label>
              <Input
                id="invite-expiry"
                type="number"
                min={1}
                max={30}
                value={expiryDays}
                onChange={(event) => setExpiryDays(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label id="invite-language-label">
                {t('admin.fields.language')}
              </Label>
              <Select
                aria-labelledby="invite-language-label"
                selectedKey={lang}
                onSelectionChange={(key) => {
                  if (
                    key === UiLanguage.en ||
                    key === UiLanguage.he ||
                    key === UiLanguage.ar
                  ) {
                    setLang(key)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UiLanguage).map((code) => (
                    <SelectItem key={code} id={code}>
                      {languageName(code) ?? code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose>{t('common.cancel')}</DialogClose>
          <Button type="submit" isDisabled={invite.isPending}>
            {invite.isPending ? t('common.loading') : t('admin.invites.send')}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
