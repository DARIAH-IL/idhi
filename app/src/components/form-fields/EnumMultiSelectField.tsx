import { useTranslation } from 'react-i18next'
import type { SuggestibleEntityField } from '@/api/models'
import { useFieldContext } from '@/components/forms/form-context'
import { SuggestValuesButton } from './SuggestValuesButton'
import { getEnumValueLabel } from '@/lib/entity'
import { FieldRow } from './FieldRow'
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { FieldError } from './FieldError'
import { firstError } from './validation'

interface Props {
  label: React.ReactNode
  options: Record<string, string>
  required?: boolean
  suggestField?: SuggestibleEntityField
}

interface Option {
  key: string
  label: string
}

export function EnumMultiSelectField({
  label,
  options,
  required = false,
  suggestField,
}: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const items: Option[] = Object.keys(options)
    .map((key) => ({
      key,
      label: getEnumValueLabel(field.name, key),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <FieldRow
      label={label}
      required={required}
      action={
        suggestField && (
          <SuggestValuesButton
            field={suggestField}
            allowedValues={options}
            onSuggested={(values) => field.handleChange(values)}
          />
        )
      }
    >
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            selectionMode="multiple"
            defaultItems={items}
            value={field.state.value ?? []}
            onChange={(keys) => field.handleChange(keys.map(String))}
            isInvalid={Boolean(error)}
            isRequired={required}
            menuTrigger="focus"
          >
            <ComboboxChips>
              <ComboboxChipList aria-labelledby={labelId}>
                {(item: Option) => (
                  <ComboboxChip textValue={item.label}>
                    {item.label}
                  </ComboboxChip>
                )}
              </ComboboxChipList>
              <ComboboxChipsInput />
            </ComboboxChips>
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
