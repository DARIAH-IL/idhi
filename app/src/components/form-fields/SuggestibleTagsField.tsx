import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
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
  knownValues: string[]
  loading?: boolean
}

interface Option {
  key: string
  label: string
}

export function SuggestibleTagsField({
  label,
  knownValues,
  loading = false,
}: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const selected = field.state.value ?? []
  const [query, setQuery] = useState('')

  const items: Option[] = useMemo(() => {
    const seen = new Set<string>()
    const options: Option[] = []
    for (const value of [...knownValues, ...selected]) {
      if (!seen.has(value)) {
        seen.add(value)
        options.push({ key: value, label: value })
      }
    }

    const trimmed = query.trim()
    if (!trimmed) {
      return options
    }

    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(trimmed.toLowerCase()),
    )
    const hasExactMatch = options.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    )
    if (hasExactMatch) {
      return filtered
    }
    return [
      { key: trimmed, label: t('entity.form.add_value', { term: trimmed }) },
      ...filtered,
    ]
  }, [knownValues, selected, query, t])

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            selectionMode="multiple"
            items={items}
            inputValue={query}
            onInputChange={setQuery}
            value={selected}
            onChange={(keys) => {
              field.handleChange(keys.map(String))
              setQuery('')
            }}
            isInvalid={Boolean(error)}
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
                  <ComboboxEmpty>
                    {loading
                      ? t('entity.picker.searching')
                      : t('entity.form.autocomplete_no_results')}
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
