import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { getLanguageOptions } from '@/lib/languages'
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
}

interface Option {
  key: string
  label: string
}

export function LanguagesField({ label }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const error = firstError(field.state.meta.errors)

  const { items, languageFilter } = useMemo(() => {
    const options = getLanguageOptions()
    const optionsByLabel = new Map(
      options.map((option) => [option.label, option]),
    )
    return {
      items: options.map((option): Option => ({
        key: option.code,
        label: option.label,
      })),
      languageFilter: (textValue: string, inputValue: string) => {
        const query = inputValue.trim().toLowerCase()
        if (!query) {
          return true
        }
        return (
          optionsByLabel.get(textValue)?.searchText ?? textValue.toLowerCase()
        ).includes(query)
      },
    }
  }, [])

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            selectionMode="multiple"
            defaultItems={items}
            defaultFilter={languageFilter}
            value={field.state.value ?? []}
            onChange={(keys) => field.handleChange(keys.map(String))}
            isInvalid={Boolean(error)}
            menuTrigger="focus"
          >
            <ComboboxChips>
              <ComboboxChipList>
                {(item: Option) => <ComboboxChip>{item.label}</ComboboxChip>}
              </ComboboxChipList>
              <ComboboxChipsInput />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxList
                items={items}
                renderEmptyState={() => (
                  <ComboboxEmpty>
                    {t('entity.form.autocomplete_no_results')}
                  </ComboboxEmpty>
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
