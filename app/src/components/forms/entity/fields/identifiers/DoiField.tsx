import type { DoiSuggestion } from '#/api/external/crossref.ts'
import {
  formatDoiAuthors,
  normalizeDoi,
  searchCrossrefWorks,
} from '#/api/external/crossref.ts'
import { AutocompleteTextField } from '#/components/form-fields/AutocompleteTextField.tsx'
import { AutocompleteSuggestionContent } from '#/components/form-fields/AutocompleteSuggestionContent.tsx'

interface Props {
  label: React.ReactNode
  placeholder?: string
  onSelect?: (suggestion: DoiSuggestion) => void
}

function doiSubtitle(suggestion: DoiSuggestion): string {
  return [
    formatDoiAuthors(suggestion.authors),
    suggestion.year,
    suggestion.containerTitle,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function DoiField({ label, placeholder, onSelect }: Props) {
  return (
    <AutocompleteTextField<DoiSuggestion>
      label={label}
      placeholder={placeholder}
      search={searchCrossrefWorks}
      shouldSearch={(query) => !/^(https?:\/\/|10\.|doi:)/i.test(query)}
      getSuggestionValue={(suggestion) => `https://doi.org/${suggestion.doi}`}
      normalizeValue={normalizeDoi}
      onSelect={onSelect}
      renderSuggestion={(suggestion) => (
        <AutocompleteSuggestionContent
          title={suggestion.title}
          subtitle={doiSubtitle(suggestion) || undefined}
          identifier={suggestion.doi}
        />
      )}
    />
  )
}
