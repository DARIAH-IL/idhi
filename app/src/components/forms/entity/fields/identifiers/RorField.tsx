import type { RorSuggestion } from '#/api/external/ror.ts'
import { useTranslation } from 'react-i18next'
import { searchRorOrganizations } from '#/api/external/ror.ts'
import { AutocompleteTextField } from '#/components/form-fields/AutocompleteTextField.tsx'
import { AutocompleteSuggestionContent } from '#/components/form-fields/AutocompleteSuggestionContent.tsx'

interface Props {
  label: React.ReactNode
  placeholder?: string
  onSelect?: (suggestion: RorSuggestion) => void
}

export function rorLocation(suggestion: RorSuggestion): string {
  return [suggestion.city, suggestion.country].filter(Boolean).join(', ')
}

export function RorField({ label, placeholder, onSelect }: Props) {
  const { t } = useTranslation()

  return (
    <AutocompleteTextField<RorSuggestion>
      label={label}
      placeholder={
        placeholder ?? t('entity.form.identifier_search_placeholder')
      }
      search={searchRorOrganizations}
      shouldSearch={(query) => !/^https?:\/\//i.test(query)}
      getSuggestionValue={(suggestion) => suggestion.id}
      onSelect={onSelect}
      renderSuggestion={(suggestion) => (
        <AutocompleteSuggestionContent
          title={suggestion.name}
          subtitle={rorLocation(suggestion) || undefined}
          identifier={suggestion.id}
        />
      )}
    />
  )
}
