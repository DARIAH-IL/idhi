import type { Bindings } from '../bindings'
import type { RequestLogger } from '../middleware/logger'
import type { AiTool } from './ai'
import { isRecord } from './ai'

const MAX_PAGE_CHARACTERS = 6000
const NAVIGATION_TIMEOUT_MS = 20000
const ACTION_TIMEOUT_MS = 20000
const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`]+/gi
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i

const INVALID_INPUT_MESSAGE =
  'Invalid tool input. Provide the url argument as a string.'
const INVALID_URL_MESSAGE =
  'Invalid URL. Provide an absolute http:// or https:// URL taken from the record.'
const UNKNOWN_URL_MESSAGE =
  'That URL does not appear in the record. Only URLs present in the record can be inspected.'
const UNRETRIEVABLE_MESSAGE = 'Unable to retrieve the requested page.'
const EMPTY_PAGE_MESSAGE =
  'The page was retrieved but contained no readable text.'

function canonicalUrl(value: string): string | undefined {
  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  const candidate = SCHEME_PATTERN.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  let url: URL

  try {
    url = new URL(candidate)
  } catch {
    return undefined
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return undefined
  }

  if (!url.hostname) {
    return undefined
  }

  const path = url.pathname.replace(/\/+$/, '')

  return `${url.protocol}//${url.host.toLowerCase()}${path}${url.search}`
}

export function extractUrls(text: string): string[] {
  const urls = new Set<string>()

  for (const match of text.match(URL_PATTERN) ?? []) {
    const canonical = canonicalUrl(match.replace(TRAILING_PUNCTUATION, ''))

    if (canonical) {
      urls.add(canonical)
    }
  }

  return [...urls]
}

function limitContent(markdown: string): string {
  const normalized = markdown.trim()

  if (!normalized) {
    return EMPTY_PAGE_MESSAGE
  }

  if (normalized.length <= MAX_PAGE_CHARACTERS) {
    return normalized
  }

  return `${normalized.slice(0, MAX_PAGE_CHARACTERS)}\n\n[Truncated: only the first ${MAX_PAGE_CHARACTERS} characters of the page are shown.]`
}

async function fetchPageMarkdown(
  bindings: Bindings,
  logger: RequestLogger,
  url: string,
  logAttributes: Record<string, unknown>,
): Promise<string> {
  const startedAt = Date.now()

  try {
    const response = await bindings.BROWSER.quickAction('markdown', {
      url,
      gotoOptions: {
        timeout: NAVIGATION_TIMEOUT_MS,
        waitUntil: 'domcontentloaded',
      },
      actionTimeout: ACTION_TIMEOUT_MS,
      rejectResourceTypes: ['image', 'media', 'font', 'stylesheet'],
      bestAttempt: true,
    })

    if (!response.ok) {
      logger.warn('Web page inspection returned an error status', {
        ...logAttributes,
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
      })

      return UNRETRIEVABLE_MESSAGE
    }

    const payload: unknown = await response.json()

    if (
      !isRecord(payload) ||
      payload.success !== true ||
      typeof payload.result !== 'string'
    ) {
      logger.warn('Web page inspection returned an unexpected payload', {
        ...logAttributes,
        url,
        durationMs: Date.now() - startedAt,
      })

      return UNRETRIEVABLE_MESSAGE
    }

    const content = limitContent(payload.result)

    logger.debug('Web page inspection completed', {
      ...logAttributes,
      url,
      durationMs: Date.now() - startedAt,
      pageCharacters: payload.result.length,
      returnedCharacters: content.length,
    })

    return content
  } catch (error) {
    logger.warn('Web page inspection failed', {
      ...logAttributes,
      url,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    })

    return UNRETRIEVABLE_MESSAGE
  }
}

export function inspectUrlTool(
  bindings: Bindings,
  logger: RequestLogger,
  allowedUrls: string[],
  logAttributes: Record<string, unknown> = {},
): AiTool {
  const allowed = new Set(allowedUrls)

  return {
    definition: {
      type: 'function',
      function: {
        name: 'inspect_url',
        description:
          'Inspect a publicly accessible web page and return its rendered text as Markdown. Use this only when a URL that appears in the record may contain information needed for the classification and the record itself does not provide enough evidence. The URL must be copied exactly from the record; invented URLs are rejected.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description:
                'The relevant publicly accessible URL, copied exactly from the record.',
            },
          },
          required: ['url'],
          additionalProperties: false,
        },
      },
    },
    async run(args) {
      const { url } = args

      if (typeof url !== 'string') {
        return INVALID_INPUT_MESSAGE
      }

      const canonical = canonicalUrl(url)

      if (!canonical) {
        return INVALID_URL_MESSAGE
      }

      if (!allowed.has(canonical)) {
        logger.warn('Web page inspection rejected a URL outside the record', {
          ...logAttributes,
          url: canonical,
        })

        return UNKNOWN_URL_MESSAGE
      }

      return fetchPageMarkdown(bindings, logger, canonical, logAttributes)
    },
  }
}
