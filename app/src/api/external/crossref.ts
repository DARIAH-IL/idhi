import { AUTOCOMPLETE_MAX_RESULTS } from '@/lib/autocomplete'

export type DoiSuggestion = {
  doi: string
  title: string
  authors: string[]
  year?: number
  publishedDate?: string
  containerTitle?: string
  publisher?: string
}

interface CrossrefDate {
  'date-parts'?: (number | null)[][]
}

interface CrossrefWork {
  DOI?: string
  title?: string[]
  author?: { family?: string; name?: string }[]
  published?: CrossrefDate
  'published-print'?: CrossrefDate
  'published-online'?: CrossrefDate
  'container-title'?: string[]
  publisher?: string
}

const DOI_PATTERN =
  /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)?(10\.\d{4,9}\/\S+)$/i

export function normalizeDoi(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return trimmed
  }
  const match = DOI_PATTERN.exec(trimmed)
  const doi = match?.[1]
  return doi ? `https://doi.org/${doi}` : trimmed
}

export function formatDoiAuthors(authors: string[]): string {
  const [first, second] = authors
  if (!first) {
    return ''
  }
  if (authors.length === 1) {
    return first
  }
  if (authors.length === 2 && second) {
    return `${first} & ${second}`
  }
  return `${first} et al.`
}

function extractPublication(work: CrossrefWork): {
  year?: number
  date?: string
} {
  const dateFields = [
    'published',
    'published-print',
    'published-online',
  ] as const
  for (const field of dateFields) {
    const parts = work[field]?.['date-parts']?.[0]
    if (!parts) {
      continue
    }
    const [year, month, day] = parts
    if (typeof year !== 'number') {
      continue
    }
    if (typeof month === 'number' && typeof day === 'number') {
      const pad = (part: number) => String(part).padStart(2, '0')
      return { year, date: `${year}-${pad(month)}-${pad(day)}` }
    }
    return { year }
  }
  return {}
}

export async function searchCrossrefWorks(
  query: string,
  signal?: AbortSignal,
): Promise<DoiSuggestion[]> {
  const url = new URL('https://api.crossref.org/works')
  url.searchParams.set('query.bibliographic', query)
  url.searchParams.set('rows', String(AUTOCOMPLETE_MAX_RESULTS))
  url.searchParams.set(
    'select',
    'DOI,title,author,published,published-print,published-online,container-title,publisher',
  )

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Crossref search failed (${response.status})`)
  }

  const data: { message?: { items?: CrossrefWork[] } } = await response.json()
  const items = Array.isArray(data.message?.items) ? data.message.items : []

  return items.slice(0, AUTOCOMPLETE_MAX_RESULTS).flatMap((work) => {
    const doi = work.DOI
    const title = work.title?.[0]
    if (!doi || !title) {
      return []
    }
    const authors = (work.author ?? [])
      .map((author) => author.family ?? author.name)
      .filter((name): name is string => Boolean(name))
    const { year, date } = extractPublication(work)
    return [
      {
        doi,
        title,
        authors,
        year,
        publishedDate: date,
        containerTitle: work['container-title']?.[0],
        publisher: work.publisher,
      },
    ]
  })
}
