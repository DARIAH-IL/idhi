import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ScaffoldProps {
  children: React.ReactNode
  isSubmitting?: boolean
  onSubmit: () => void
}

export function FormScaffold({
  children,
  isSubmitting,
  onSubmit,
}: ScaffoldProps) {
  const { t } = useTranslation()

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
      {children}
    </>
  )
}
