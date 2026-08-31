import type { OrcidSuggestion } from '#/api/external/orcid.ts'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <AutocompleteTextField<OrcidSuggestion>
      label={label}
      placeholder={
        placeholder ?? t('entity.form.identifier_search_placeholder')
      }
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
