import { HugeiconsIcon } from '@hugeicons/react'
import { ExternalLinkIcon } from '@hugeicons/core-free-icons'

export function ExternalLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="app-link break-all"
    >
      {children}
      <HugeiconsIcon
        icon={ExternalLinkIcon}
        className="ms-1 inline size-3 align-[-2px] text-muted-foreground"
      />
    </a>
  )
}
