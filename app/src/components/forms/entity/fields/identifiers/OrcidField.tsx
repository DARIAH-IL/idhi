import type { OrcidSuggestion } from '#/api/external/orcid.ts'
import {
  normalizeOrcid,
  orcidDisplayName,
  searchOrcidPeople,
} from '#/api/external/orcid.ts'
import { AutocompleteTextField } from '#/components/form-fields/AutocompleteTextField.tsx'
import { AutocompleteSuggestionContent } from '#/components/form-fields/AutocompleteSuggestionContent.tsx'

interface Props {
  label: React.ReactNode
  placeholder?: string
  onSelect?: (suggestion: OrcidSuggestion) => void
}

export function OrcidField({ label, placeholder, onSelect }: Props) {
  return (
    <AutocompleteTextField<OrcidSuggestion>
      label={label}
      placeholder={placeholder}
      search={searchOrcidPeople}
      shouldSearch={(query) => !/^(https?:\/\/|\d{4}-)/i.test(query)}
      getSuggestionValue={(suggestion) => suggestion.id}
      normalizeValue={normalizeOrcid}
      onSelect={onSelect}
      renderSuggestion={(suggestion) => (
        <AutocompleteSuggestionContent
          title={orcidDisplayName(suggestion)}
          subtitle={
            suggestion.institutions.slice(0, 2).join(' · ') || undefined
          }
          identifier={suggestion.id}
        />
      )}
    />
  )
}
