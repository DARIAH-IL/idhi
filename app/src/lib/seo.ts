import type { Entity, UiLanguage } from '@/api/models'

const SITE_URL = 'https://idh-index.org'
const LANGUAGES: readonly UiLanguage[] = ['en', 'he', 'ar']

const OPEN_GRAPH_LOCALES: Record<UiLanguage, string> = {
  en: 'en_GB',
  he: 'he_IL',
  ar: 'ar_IL',
}

const SCHEMA_TYPES: Record<Entity['type'], string> = {
  'idhi:Person': 'Person',
  'idhi:Organization': 'Organization',
  'idhi:Facility': 'Place',
  'idhi:Project': 'ResearchProject',
  'idhi:Tool': 'SoftwareApplication',
  'idhi:Service': 'Service',
  'idhi:Publication': 'CreativeWork',
  'idhi:Event': 'Event',
  'idhi:Dataset': 'Dataset',
  'idhi:TrainingMaterial': 'LearningResource',
}

interface SeoMetadata {
  title: string
  pageTitle: string
  siteName: string
  description: string
  language: UiLanguage
  pathname: string
  entity: Entity | null
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
}

function setLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.append(element)
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
}

function localizedUrl(pathname: string, language: UiLanguage) {
  const url = new URL(pathname, SITE_URL)
  url.searchParams.set('lang', language)
  return url.href
}

function isPrivatePath(pathname: string) {
  return (
    pathname === '/entities/new' ||
    /^\/entities\/[^/]+\/edit\/?$/.test(pathname) ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/oauth')
  )
}

export function updateSeoMetadata({
  title,
  pageTitle,
  siteName,
  description,
  language,
  pathname,
  entity,
}: SeoMetadata) {
  const canonicalUrl = localizedUrl(pathname, language)
  const imageUrl = `${SITE_URL}/logo.png`

  document.title = title
  setMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  })
  setMeta('meta[name="robots"]', {
    name: 'robots',
    content: isPrivatePath(pathname) ? 'noindex, nofollow' : 'index, follow',
  })
  setMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: entity ? 'article' : 'website',
  })
  setMeta('meta[property="og:site_name"]', {
    property: 'og:site_name',
    content: siteName,
  })
  setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  setMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  })
  setMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  })
  setMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: imageUrl,
  })
  setMeta('meta[property="og:image:alt"]', {
    property: 'og:image:alt',
    content: siteName,
  })
  setMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: OPEN_GRAPH_LOCALES[language],
  })
  setLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })

  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove())
  for (const alternateLanguage of LANGUAGES) {
    setLink(`link[rel="alternate"][hreflang="${alternateLanguage}"]`, {
      rel: 'alternate',
      hreflang: alternateLanguage,
      href: localizedUrl(pathname, alternateLanguage),
    })
  }
  setLink('link[rel="alternate"][hreflang="x-default"]', {
    rel: 'alternate',
    hreflang: 'x-default',
    href: localizedUrl(pathname, 'en'),
  })

  const structuredData = entity
    ? {
        '@context': 'https://schema.org',
        '@type': SCHEMA_TYPES[entity.type],
        '@id': canonicalUrl,
        url: canonicalUrl,
        identifier: entity.id,
        name: pageTitle,
        description,
        inLanguage: language,
        isPartOf: {
          '@type': 'WebSite',
          name: siteName,
          url: SITE_URL,
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteName,
        description,
        inLanguage: LANGUAGES,
      }

  let script = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-structured-data]',
  )
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seoStructuredData = ''
    document.head.append(script)
  }
  script.textContent = JSON.stringify(structuredData).replaceAll('<', '\\u003c')
}
