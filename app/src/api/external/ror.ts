import { AUTOCOMPLETE_MAX_RESULTS } from '@/lib/autocomplete'

export type RorSuggestion = {
  id: string
  name: string
  city?: string
  country?: string
}

interface RorName {
  value?: string
  types?: string[]
}

interface RorLocation {
  geonames_details?: {
    name?: string
    country_name?: string
  }
}

interface RorOrganization {
  id?: string
  names?: RorName[]
  locations?: RorLocation[]
}

export async function searchRorOrganizations(
  query: string,
  signal?: AbortSignal,
): Promise<RorSuggestion[]> {
  const url = new URL('https://api.ror.org/v2/organizations')
  url.searchParams.set('query', query)

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`ROR search failed (${response.status})`)
  }

  const data: { items?: RorOrganization[] } = await response.json()
  const items = Array.isArray(data.items) ? data.items : []

  return items.slice(0, AUTOCOMPLETE_MAX_RESULTS).flatMap((organization) => {
    const names = organization.names ?? []
    const displayName =
      names.find((name) => name.types?.includes('ror_display')) ??
      names.find((name) => name.types?.includes('label')) ??
      names[0]
    if (!organization.id || !displayName?.value) {
      return []
    }
    const geonames = organization.locations?.[0]?.geonames_details
    return [
      {
        id: organization.id,
        name: displayName.value,
        city: geonames?.name,
        country: geonames?.country_name,
      },
    ]
  })
}
