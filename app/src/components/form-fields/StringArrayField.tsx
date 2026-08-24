import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import { firstError } from './validation'

interface Props {
  label: string
  placeholder?: string
  options?: Record<string, string>
}

export function StringArrayField({ label, placeholder, options }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const items = field.state.value ?? []

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={item}
              onChange={(event) =>
                field.handleChange(
                  items.map((value, itemIndex) =>
                    itemIndex === index ? event.target.value : value,
                  ),
                )
              }
              placeholder={placeholder}
              className="flex-1"
              list={options ? `${field.name}-options` : undefined}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onPress={() => field.removeValue(index)}
              aria-label={t('common.remove')}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      {options && (
        <datalist id={`${field.name}-options`}>
          {Object.keys(options).map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
      <Button
        variant="outline"
        size="sm"
        onPress={() => field.pushValue('')}
        className="w-fit"
      >
        + {t('entity.form.add_item')}
      </Button>
    </div>
  )
}
