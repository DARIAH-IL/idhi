import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { finished } from 'node:stream/promises'
import { SitemapStream } from 'sitemap'
import type { FileRouteTypes } from '../src/routeTree.gen'

type StaticPath = FileRouteTypes['to']

const siteUrl = (process.env.SITE_URL ?? 'https://idh-index.org').replace(
  /\/$/,
  '',
)
const languages = ['en', 'he', 'ar']
const staticPaths: StaticPath[] = [
  '/entities',
  '/about',
  '/about/ai',
  '/privacy-policy',
  '/terms-of-use',
]

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

sitemap.end()
await finished(output)
console.log(
  `Generated sitemap.xml with ${staticPaths.length * languages.length} localized URLs.`,
)
