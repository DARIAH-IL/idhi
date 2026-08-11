import { useTranslation } from 'react-i18next'
import { useFormContext } from './form-type'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function ArraySection({
  name,
  label,
  defaultItem,
  children,
}: {
  name: string
  label: string
  defaultItem: Record<string, unknown>
  children: (index: number) => React.ReactNode
}) {
  const { t } = useTranslation()
  const form = useFormContext()

  return (
    <>
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <form.Field name={name as never} mode="array">
        {(field) => (
          <>
            {((field.state.value as unknown[]) ?? []).map((_, i) => (
              <div key={i} className="rounded border p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">#{i + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onPress={() => field.removeValue(i)}
                  >
                    ×
                  </Button>
                </div>
                {children(i)}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onPress={() => field.pushValue(defaultItem as never)}
            >
              + {label}
            </Button>
          </>
        )}
      </form.Field>
    </>
  )
}
