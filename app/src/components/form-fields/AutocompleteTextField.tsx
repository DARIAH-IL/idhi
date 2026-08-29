import { useRef } from 'react'
import { useFieldContext } from '@/components/forms/form-context'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { FieldRow } from './FieldRow'
import { Input } from '@/components/ui/input'
import { FieldError } from './FieldError'
import { firstError } from './validation'
import { AutocompleteSuggestionList } from './AutocompleteSuggestionList'

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
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)
  const value = field.state.value ?? ''
  const inputRef = useRef<HTMLInputElement>(null)

  const autocomplete = useAutocomplete<T>({
    search,
    shouldSearch,
    onPick: (item) => {
      field.handleChange(getSuggestionValue(item))
      onSelect?.(item)
    },
  })

  const handleBlur = () => {
    if (normalizeValue) {
      const normalized = normalizeValue(String(value))
      if (normalized !== value) {
        field.handleChange(normalized)
      }
    }
    field.handleBlur()
    window.setTimeout(() => autocomplete.close(), 150)
  }

  return (
    <FieldRow label={label}>
      <>
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={autocomplete.open}
          autoComplete="off"
          value={value}
          onChange={(event) => {
            field.handleChange(event.target.value)
            autocomplete.handleQueryChange(event.target.value)
          }}
          onKeyDown={autocomplete.handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
        />
        <AutocompleteSuggestionList
          triggerRef={inputRef}
          isOpen={autocomplete.open}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              autocomplete.close()
            }
          }}
          items={autocomplete.items}
          loading={autocomplete.loading}
          searched={autocomplete.searched}
          activeIndex={autocomplete.activeIndex}
          getItemKey={getSuggestionValue}
          renderItem={renderSuggestion}
          onPick={autocomplete.pick}
        />
        <FieldError error={error} />
      </>
    </FieldRow>
  )
}
