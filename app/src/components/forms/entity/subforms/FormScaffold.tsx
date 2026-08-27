import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-form'
import { useBlocker } from '@tanstack/react-router'
import type { AnyFormApi } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ScaffoldProps {
  form: AnyFormApi
  children: React.ReactNode
  isSubmitting?: boolean
  onSubmit: () => void
}

export function FormScaffold({
  form,
  children,
  isSubmitting,
  onSubmit,
}: ScaffoldProps) {
  const { t } = useTranslation()
  const isDirty = useStore(
    form.store,
    (state) => state.isDirty && !state.isSubmitSuccessful,
  )

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) {
        return false
      }
      return !window.confirm(t('entity.form.unsaved_changes'))
    },
    enableBeforeUnload: () => isDirty,
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {children}
      <Separator />
      <div className="flex gap-2">
        <Button type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('common.save')}
        </Button>
        <Button variant="outline" onPress={() => window.history.back()}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}

export function SpecificSection({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <>
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t('entity.form.sections.specific')}
      </p>
      <div className="grid items-start gap-4 lg:grid-cols-2">{children}</div>
    </>
  )
}
