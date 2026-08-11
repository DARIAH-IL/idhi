import { useTranslation } from 'react-i18next'
import { useFormContext } from './form-type'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function StringArrayField({
  name,
  label,
  placeholder,
}: {
  name: string
  label: string
  placeholder?: string
}) {
  const { t } = useTranslation()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <form.Field name={name as never} mode="array">
        {(field) => (
          <>
            <div className="flex flex-col gap-1.5">
              {((field.state.value as string[]) ?? []).map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <form.Field name={`${name}[${i}]` as never}>
                    {(itemField) => (
                      <Input
                        value={(itemField.state.value) ?? ''}
                        onChange={(v) => itemField.handleChange(v as never)}
                        placeholder={placeholder}
                        className="flex-1"
                      />
                    )}
                  </form.Field>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onPress={() => field.removeValue(i)}
                    aria-label={t('common.remove')}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onPress={() => field.pushValue('' as never)}
              className="w-fit"
            >
              + {t('entity.form.add_item')}
            </Button>
          </>
        )}
      </form.Field>
    </div>
  )
}
