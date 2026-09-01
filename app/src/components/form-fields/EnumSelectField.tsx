import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { getEnumValueLabel } from '@/lib/entity'
import { FieldRow } from './FieldRow'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { FieldError } from './FieldError'
import { firstError } from './validation'

interface Props {
  label: React.ReactNode
  options: Record<string, string>
  required?: boolean
}

interface Option {
  key: string
  label: string
}

export function EnumSelectField({ label, options, required = false }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const items: Option[] = Object.keys(options)
    .map((key) => ({
      key,
      label: getEnumValueLabel(field.name, key),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <FieldRow label={label} required={required}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            defaultItems={items}
            value={field.state.value ?? null}
            onChange={(key) =>
              field.handleChange(key == null ? undefined : String(key))
            }
            isInvalid={Boolean(error)}
            isRequired={required}
            menuTrigger="focus"
          >
            <ComboboxInput />
            <ComboboxContent>
              <ComboboxList
                items={items}
                renderEmptyState={() => (
                  <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
                )}
              >
                {(item) => (
                  <ComboboxItem id={item.key} textValue={item.label}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <FieldError error={error} />
        </>
      )}
    </FieldRow>
  )
}
