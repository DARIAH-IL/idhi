import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
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

interface Props<T extends object> {
  label: React.ReactNode
  placeholder?: string
  search: (query: string, signal: AbortSignal) => Promise<T[]>
  getSuggestionValue: (item: T) => string
  renderSuggestion: (item: T) => React.ReactNode
  onSelect?: (item: T) => void
  shouldSearch?: (query: string) => boolean
  normalizeValue?: (raw: string) => string
  onBlurValue?: (value: string) => void
}

export function AutocompleteTextField<T extends object>({
  label,
  placeholder,
  search,
  getSuggestionValue,
  renderSuggestion,
  onSelect,
  shouldSearch,
  normalizeValue,
  onBlurValue,
}: Props<T>) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const value = field.state.value ?? ''

  const autocomplete = useAutocomplete<T>({ search, shouldSearch })
  const items = autocomplete.items ?? []

  useEffect(() => {
    if (autocomplete.error) {
      toast.error(t('entity.form.lookup_failed'))
    }
  }, [autocomplete.error, t])
  const itemsByKey = new Map(
    items.map((item) => [getSuggestionValue(item), item]),
  )

  const handleBlur = () => {
    let finalValue = value
    if (normalizeValue) {
      const normalized = normalizeValue(value)
      if (normalized !== value) {
        field.handleChange(normalized)
        finalValue = normalized
      }
    }
    field.handleBlur()
    onBlurValue?.(finalValue)
    window.setTimeout(autocomplete.reset, 150)
  }

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Combobox
            aria-labelledby={labelId}
            aria-busy={autocomplete.loading}
            allowsCustomValue
            allowsEmptyCollection={autocomplete.items !== undefined}
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
            <ComboboxInput
              placeholder={placeholder}
              showTrigger={false}
              dir="ltr"
            />
            <ComboboxContent className="w-max min-w-(--trigger-width) max-w-[calc(var(--trigger-width)*2)]">
              <ComboboxList
                items={items}
                renderEmptyState={() => (
                  <ComboboxEmpty
                    className={
                      autocomplete.loading
                        ? 'items-center gap-2 px-3 py-3'
                        : undefined
                    }
                    role={autocomplete.loading ? 'status' : undefined}
                  >
                    {autocomplete.loading && (
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        strokeWidth={2}
                        className="size-4 shrink-0 animate-spin"
                      />
                    )}
                    <span>
                      {autocomplete.loading
                        ? t('common.searching')
                        : t('common.no_results')}
                    </span>
                  </ComboboxEmpty>
                )}
              >
                {(item) => (
                  <ComboboxItem
                    dir="ltr"
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
