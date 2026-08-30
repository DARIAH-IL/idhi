import { AUTOCOMPLETE_MAX_RESULTS } from '@/lib/autocomplete'

export type OrcidSuggestion = {
  id: string
  givenNames?: string
  familyName?: string
  creditName?: string
  institutions: string[]
  email?: string
}

interface OrcidExpandedResult {
  'orcid-id'?: string
  'given-names'?: string | null
  'family-names'?: string | null
  'credit-name'?: string | null
  email?: string[]
  'institution-name'?: string[]
}

const ORCID_ID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i

export function normalizeOrcid(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return trimmed
  }
  const match =
    /^(?:https?:\/\/(?:www\.)?orcid\.org\/)?(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/i.exec(
      trimmed,
    )
  const id = match?.[1]
  return id ? `https://orcid.org/${id.toUpperCase()}` : trimmed
}

export function orcidDisplayName(suggestion: OrcidSuggestion): string {
  return (
    suggestion.creditName ??
    [suggestion.givenNames, suggestion.familyName].filter(Boolean).join(' ')
  )
}

export async function searchOrcidPeople(
  query: string,
  signal?: AbortSignal,
): Promise<OrcidSuggestion[]> {
  const url = new URL('https://pub.orcid.org/v3.0/expanded-search/')
  url.searchParams.set('q', query.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, ' '))
  url.searchParams.set('rows', String(AUTOCOMPLETE_MAX_RESULTS))

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`ORCID search failed (${response.status})`)
  }

  const data: { 'expanded-result'?: OrcidExpandedResult[] | null } =
    await response.json()
  const items = Array.isArray(data['expanded-result'])
    ? data['expanded-result']
    : []

  return items.slice(0, AUTOCOMPLETE_MAX_RESULTS).flatMap((person) => {
    const id = person['orcid-id']
    if (!id || !ORCID_ID_PATTERN.test(id)) {
      return []
    }
    const suggestion: OrcidSuggestion = {
      id: `https://orcid.org/${id.toUpperCase()}`,
      givenNames: person['given-names'] ?? undefined,
      familyName: person['family-names'] ?? undefined,
      creditName: person['credit-name'] ?? undefined,
      institutions: person['institution-name'] ?? [],
      email: person.email?.[0],
    }
    return orcidDisplayName(suggestion) ? [suggestion] : []
  })
}
