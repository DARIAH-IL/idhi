import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-form'
import { useBlocker } from '@tanstack/react-router'
import type { AnyFormApi } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface ScaffoldProps {
  form: AnyFormApi
  title: React.ReactNode
  children: React.ReactNode
  isSubmitting?: boolean
  canSaveAsDraft: boolean
  onSubmit: (isDraft: boolean) => void
}

export function FormScaffold({
  form,
  title,
  children,
  isSubmitting,
  canSaveAsDraft,
  onSubmit,
}: ScaffoldProps) {
  const { t } = useTranslation()
  const isDirty = useStore(
    form.store,
    (state) => state.isDirty && !state.isSubmitSuccessful,
  )

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(false)
      }}
      className="flex flex-col gap-4"
    >
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-4 bg-background px-6 py-2">
        {title}
        <div className="flex shrink-0 gap-2">
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting
              ? t('common.loading')
              : canSaveAsDraft
                ? t('entity.form.publish')
                : t('common.save')}
          </Button>
          {canSaveAsDraft && (
            <Button
              type="button"
              variant="outline"
              isDisabled={isSubmitting}
              onPress={() => onSubmit(true)}
            >
              {t('entity.form.save_draft')}
            </Button>
          )}
          <Button variant="outline" onPress={() => window.history.back()}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
      <Separator />
      <div className="columns-1 gap-4 lg:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {children}
      </div>
      <Dialog
        isOpen={status === 'blocked'}
        onOpenChange={(open) => {
          if (!open) {
            reset?.()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('entity.form.unsaved_changes_title')}</DialogTitle>
          <DialogDescription>
            {t('entity.form.unsaved_changes')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onPress={() => reset?.()}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onPress={() => proceed?.()}>
            {t('entity.form.leave_page')}
          </Button>
        </DialogFooter>
      </Dialog>
    </form>
  )
}
