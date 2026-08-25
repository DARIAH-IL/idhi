import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getGetEntityByIdQueryOptions } from '@/api/hooks/entities/entities'
import { Card, CardContent } from '@/components/ui/card'
import { EntityTags } from '@/components/entity/EntityTags'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import {
  getEntityDescription,
  getEntityDisplayName,
  getEntityTypeLabel,
} from '@/lib/entity'
import { getEntityTermUri } from '@/api/termUris/termUri'
import { EntityImage } from './EntityImage'

export function EntityReferenceCard({ entityId }: { entityId: string }) {
  const { data, isLoading, isError } = useQuery(
    getGetEntityByIdQueryOptions(entityId, {
      query: { retry: false },
    }),
  )

  if (isLoading || isError || data === undefined) {
    return (
      <Card size="sm" className="bg-muted/20">
        <CardContent className="p-2.5">
          {isLoading ? (
            <span className="text-xs text-muted-foreground">
              Loading {entityId}…
            </span>
          ) : (
            <span className="text-xs text-destructive">
              Entity unavailable: {entityId}
            </span>
          )}
        </CardContent>
      </Card>
    )
  }

  const description = getEntityDescription(data)
  const term = getEntityTermUri(data.type)

  return (
    <TooltipTrigger>
      <Card size="sm" className="bg-muted/20 hover:bg-gray-200">
        <CardContent className="p-2.5">
          <div className="flex items-center gap-3">
            <EntityImage
              image={data.image}
              type={data.type}
              alt={getEntityDisplayName(data)}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                to="/entities/$entityId"
                params={{ entityId: encodeURIComponent(entityId) }}
                className="text-sm font-semibold hover:underline"
              >
                {getEntityDisplayName(data)}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{getEntityTypeLabel(data.type)}</span>
                <span aria-hidden>·</span>
                <span className="truncate font-mono">{entityId}</span>
                <EntityTags tags={data.tags} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tooltip className="flex-col items-start gap-0.5">
        {description && <span>{description}</span>}
        {term && (
          <span className="font-mono text-[0.625rem] opacity-70">{term}</span>
        )}
      </Tooltip>
    </TooltipTrigger>
  )
}
