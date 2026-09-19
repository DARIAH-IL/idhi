import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { finished } from 'node:stream/promises'
import { SitemapStream } from 'sitemap'
import type { FileRouteTypes } from '../src/routeTree.gen'

type StaticPath = FileRouteTypes['to']

interface EntitySearchResult {
  id: string
  audit?: { modifiedAt?: string }
}

interface EntitySearchResponse {
  results: EntitySearchResult[]
  total: number
}

const siteUrl = (process.env.SITE_URL ?? 'https://idh-index.org').replace(
  /\/$/,
  '',
)
const apiUrl = (
  process.env.SITEMAP_API_URL ??
  process.env.VITE_SERVER_URL ??
  'https://api.idh-index.org'
).replace(/\/$/, '')
const languages = ['en', 'he', 'ar']
const staticPaths: StaticPath[] = [
  '/entities',
  '/about',
  '/about/ai',
  '/privacy-policy',
  '/terms-of-use',
]
const entityRoutePath: StaticPath = '/entities/$entityId'

function localizedUrl(path: string, language: string): string {
  const url = new URL(path, siteUrl)
  url.searchParams.set('lang', language)
  return url.href
}

function alternates(path: string) {
  return [
    ...languages.map((lang) => ({ lang, url: localizedUrl(path, lang) })),
    { lang: 'x-default', url: localizedUrl(path, 'en') },
  ]
}

function entityPath(entityId: string): string {
  return entityRoutePath.replace('$entityId', encodeURIComponent(entityId))
}

async function fetchPublicEntities(): Promise<EntitySearchResult[]> {
  const entities: EntitySearchResult[] = []
  const pageSize = 100
  let page = 0
  let total = Number.POSITIVE_INFINITY

  while (entities.length < total) {
    const response = await fetch(`${apiUrl}/api/v1/entities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    })
    if (!response.ok) {
      throw new Error(
        `Entity API returned ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as EntitySearchResponse
    if (!Array.isArray(data.results) || typeof data.total !== 'number') {
      throw new Error('Entity API returned an unexpected search response')
    }
    entities.push(...data.results)
    total = data.total
    if (data.results.length === 0) {
      break
    }
    page += 1
  }

  return entities
}

await mkdir(resolve('dist'), { recursive: true })
const sitemap = new SitemapStream({ hostname: siteUrl })
const output = createWriteStream(resolve('dist/sitemap.xml'))
sitemap.pipe(output)

for (const path of staticPaths) {
  for (const language of languages) {
    sitemap.write({
      url: localizedUrl(path, language),
      links: alternates(path),
      changefreq: path === '/entities' ? 'daily' : 'monthly',
      priority: path === '/entities' ? 1 : 0.6,
    })
  }
}

const entities = await fetchPublicEntities()
for (const entity of entities) {
  const path = entityPath(entity.id)
  for (const language of languages) {
    sitemap.write({
      url: localizedUrl(path, language),
      links: alternates(path),
      lastmod: entity.audit?.modifiedAt,
      changefreq: 'weekly',
      priority: 0.8,
    })
  }
}

sitemap.end()
await finished(output)
console.log(
  `Generated sitemap.xml with ${staticPaths.length * languages.length + entities.length * languages.length} localized URLs.`,
)
