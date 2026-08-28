import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  label: React.ReactNode
  defaultItem: Record<string, unknown>
  children: (index: number) => React.ReactNode
}

export function ArraySection({ label, defaultItem, children }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<
    Array<Record<string, unknown>> | null | undefined
  >()
  const items = field.state.value ?? []

  return (
    <div className="lg:col-span-2 flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="ml-3 flex flex-col gap-3">
        {items.map((_, index) => (
          <div
            key={index}
            className="rounded border p-3 grid items-start gap-2 lg:grid-cols-2"
          >
            <div className="lg:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">#{index + 1}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onPress={() => field.removeValue(index)}
                aria-label={t('common.remove')}
              >
                ×
              </Button>
            </div>
            {children(index)}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onPress={() => field.pushValue(defaultItem)}
        >
          + {label}
        </Button>
      </div>
    </div>
  )
}
