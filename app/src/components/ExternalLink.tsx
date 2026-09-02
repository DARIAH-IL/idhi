import { cn } from '#/lib/utils.ts'

function safeHostname(href: string): string | undefined {
  try {
    return new URL(href).hostname
  } catch {
    try {
      return new URL(`https://${href}`).hostname
    } catch {
      return undefined
    }
  }
}

export function ExternalLink({
  href,
  refText,
  preferFaviconOnly,
}: {
  href: string
  refText?: string
  preferFaviconOnly?: boolean
}) {
  const linkText =
    refText ||
    href.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace('https://', '')
  const hostname = safeHostname(href)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={preferFaviconOnly ? linkText : undefined}
      className="app-link break-all"
    >
      {hostname && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
          alt=""
          className={cn(
            'inline size-4 rounded-sm align-[-3px]',
            preferFaviconOnly ? undefined : 'me-1.5',
          )}
        />
      )}

      {!preferFaviconOnly && <>{linkText}</>}
    </a>
  )
}
