import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { useAutocomplete } from '@/hooks/useAutocomplete'
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
  search?: (query: string, signal: AbortSignal) => Promise<string[]>
  loading?: boolean
}

interface Option {
  key: string
  label: string
}

const NO_SEARCH = async () => []

export function SuggestibleTagsField({
  label,
  knownValues,
  search,
  loading = false,
}: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const selected = field.state.value ?? []
  const [query, setQuery] = useState('')
  const autocomplete = useAutocomplete<string>({
    search: search ?? NO_SEARCH,
    shouldSearch: () => Boolean(search),
    minQueryLength: 1,
  })

  const trimmed = query.trim()
  const searching = Boolean(search) && trimmed.length > 0
  const isLoading = loading || autocomplete.loading

  const items: Option[] = useMemo(() => {
    const values = searching
      ? [...(autocomplete.items ?? []), ...selected]
      : [...knownValues, ...selected]

    const seen = new Set<string>()
    const options: Option[] = []
    for (const value of values) {
      if (!seen.has(value)) {
        seen.add(value)
        options.push({ key: value, label: value })
      }
    }

    if (!trimmed || autocomplete.loading) {
      return options
    }

    if (!searching) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(trimmed.toLowerCase()),
      )
      const hasExactMatch = options.some(
        (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
      )
      return hasExactMatch
        ? filtered
        : [
            {
              key: trimmed,
              label: t('entity.form.add_value', { term: trimmed }),
            },
            ...filtered,
          ]
    }

    const hasExactMatch = options.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    )
    if (hasExactMatch) {
      return options
    }
    return [
      { key: trimmed, label: t('entity.form.add_value', { term: trimmed }) },
      ...options,
    ]
  }, [
    knownValues,
    selected,
    searching,
    trimmed,
    autocomplete.items,
    autocomplete.loading,
    t,
  ])

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            selectionMode="multiple"
            items={items}
            inputValue={query}
            onInputChange={(value) => {
              setQuery(value)
              autocomplete.handleQueryChange(value)
            }}
            value={selected}
            onChange={(keys) => {
              field.handleChange(keys.map(String))
              setQuery('')
              autocomplete.reset()
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
                    {isLoading ? t('common.searching') : t('common.no_results')}
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
