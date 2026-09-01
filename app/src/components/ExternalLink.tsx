import { cn } from '#/lib/utils.ts'

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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={preferFaviconOnly ? linkText : undefined}
      className="app-link break-all"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${new URL(href).hostname}&sz=32`}
        alt=""
        className={cn(
          'inline size-4 rounded-sm align-[-3px]',
          preferFaviconOnly ? undefined : 'me-1.5',
        )}
      />

      {!preferFaviconOnly && <>{linkText}</>}
    </a>
  )
}
