import { Link } from '@tanstack/react-router'
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
      {[...tags].sort().map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="relative bg-accent-foreground/10 border-accent-foreground/15 hover:bg-accent-foreground/20"
          render={(props) => (
            <Link
              {...props}
              to="/entities"
              search={{ facetFilters: { tags: { include: [tag] } } }}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {tag}
            </Link>
          )}
        />
      ))}
    </>
  )
}
