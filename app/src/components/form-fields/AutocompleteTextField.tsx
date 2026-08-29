import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { useAutocomplete } from '@/hooks/useAutocomplete'
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

interface Props<T> {
  label: React.ReactNode
  placeholder?: string
  search: (query: string, signal: AbortSignal) => Promise<T[]>
  getSuggestionValue: (item: T) => string
  renderSuggestion: (item: T) => React.ReactNode
  onSelect?: (item: T) => void
  shouldSearch?: (query: string) => boolean
  normalizeValue?: (raw: string) => string
}

export function AutocompleteTextField<T>({
  label,
  placeholder,
  search,
  getSuggestionValue,
  renderSuggestion,
  onSelect,
  shouldSearch,
  normalizeValue,
}: Props<T>) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const value = field.state.value ?? ''

  const autocomplete = useAutocomplete<T>({ search, shouldSearch })
  const items = autocomplete.items ?? []
  const itemsByKey = new Map(
    items.map((item) => [getSuggestionValue(item), item]),
  )

  const handleBlur = () => {
    if (normalizeValue) {
      const normalized = normalizeValue(value)
      if (normalized !== value) {
        field.handleChange(normalized)
      }
    }
    field.handleBlur()
    window.setTimeout(autocomplete.reset, 150)
  }

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            allowsCustomValue
            items={autocomplete.items}
            inputValue={value}
            onInputChange={(query) => {
              field.handleChange(query)
              autocomplete.handleQueryChange(query)
            }}
            onChange={(key) => {
              if (key == null) {
                return
              }
              const item = itemsByKey.get(String(key))
              if (item) {
                field.handleChange(getSuggestionValue(item))
                onSelect?.(item)
              }
            }}
            isInvalid={Boolean(error)}
            onBlur={handleBlur}
          >
            <ComboboxInput placeholder={placeholder} showTrigger={false} />
            <ComboboxContent>
              <ComboboxList
                items={items}
                renderEmptyState={() => (
                  <ComboboxEmpty>
                    {autocomplete.loading
                      ? t('entity.picker.searching')
                      : t('entity.form.autocomplete_no_results')}
                  </ComboboxEmpty>
                )}
              >
                {(item) => (
                  <ComboboxItem
                    id={getSuggestionValue(item)}
                    textValue={getSuggestionValue(item)}
                  >
                    {renderSuggestion(item)}
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
