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

const ROR_ID_PATTERN = /^(?:https?:\/\/ror\.org\/)?(0[a-hj-km-np-tv-z0-9]{6}\d{2})$/i

export function extractRorId(raw: string): string | null {
  return ROR_ID_PATTERN.exec(raw.trim())?.[1]?.toLowerCase() ?? null
}

export function normalizeRor(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return trimmed
  }
  const id = extractRorId(trimmed)
  return id ? `https://ror.org/${id}` : trimmed
}

function toRorSuggestion(organization: RorOrganization): RorSuggestion | null {
  const names = organization.names ?? []
  const displayName =
    names.find((name) => name.types?.includes('ror_display')) ??
    names.find((name) => name.types?.includes('label')) ??
    names[0]
  if (!organization.id || !displayName?.value) {
    return null
  }
  const geonames = organization.locations?.[0]?.geonames_details
  return {
    id: organization.id,
    name: displayName.value,
    city: geonames?.name,
    country: geonames?.country_name,
  }
}

async function fetchRorOrganization(
  id: string,
  signal?: AbortSignal,
): Promise<RorSuggestion[]> {
  const response = await fetch(
    `https://api.ror.org/v2/organizations/${encodeURIComponent(id)}`,
    { signal },
  )
  if (response.status === 404) {
    return []
  }
  if (!response.ok) {
    throw new Error(`ROR lookup failed (${response.status})`)
  }

  const organization: RorOrganization = await response.json()
  const suggestion = toRorSuggestion(organization)
  return suggestion ? [suggestion] : []
}

export async function searchRorOrganizations(
  query: string,
  signal?: AbortSignal,
): Promise<RorSuggestion[]> {
  const id = extractRorId(query)
  if (id) {
    return fetchRorOrganization(id, signal)
  }

  const url = new URL('https://api.ror.org/v2/organizations')
  url.searchParams.set('query', query)

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`ROR search failed (${response.status})`)
  }

  const data: { items?: RorOrganization[] } = await response.json()
  const items = Array.isArray(data.items) ? data.items : []

  return items.slice(0, AUTOCOMPLETE_MAX_RESULTS).flatMap((organization) => {
    const suggestion = toRorSuggestion(organization)
    return suggestion ? [suggestion] : []
  })
}
