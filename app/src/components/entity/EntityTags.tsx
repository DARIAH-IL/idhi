import { Badge } from '@/components/ui/badge'

export function EntityTags({
  tags,
  separator = true,
}: {
  tags: string[] | null | undefined
  separator?: boolean
}) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <>
      {separator && <span aria-hidden>·</span>}
      {tags.sort().map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="bg-accent-foreground/10 border-accent-foreground/15"
        >
          {tag}
        </Badge>
      ))}
    </>
  )
}
