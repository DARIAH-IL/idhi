import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ConfirmDialog({
  title,
  description,
  action,
  isPending,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  action: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog isOpen onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>{t('common.cancel')}</DialogClose>
        <Button
          variant="destructive"
          isDisabled={isPending}
          onPress={onConfirm}
        >
          {isPending ? t('common.loading') : action}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
