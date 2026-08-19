import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getGetApiV1EntitiesEntityIdQueryOptions } from '@/api/hooks/entities/entities'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  getEntityDescription,
  getEntityDisplayName,
  getEntityTypeLabel,
} from '@/lib/entity'
import { EntityImage } from './EntityImage'

export function EntityReferenceCard({ entityId }: { entityId: string }) {
  const { data, isLoading, isError } = useQuery(
    getGetApiV1EntitiesEntityIdQueryOptions(entityId, {
      query: { retry: false },
    }),
  )

  return (
    <Card size="sm" className="bg-muted/20">
      <CardContent className="p-2.5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">
            Loading {entityId}…
          </span>
        ) : isError || !data ? (
          <span className="text-xs text-destructive">
            Entity unavailable: {entityId}
          </span>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-2.5">
              <EntityImage
                image={data.image}
                type={data.type}
                alt={getEntityDisplayName(data)}
              />
              <div className="min-w-0">
                <Link
                  to="/entities/$entityId"
                  params={{ entityId: encodeURIComponent(entityId) }}
                  className="text-sm font-medium hover:underline"
                >
                  {getEntityDisplayName(data)}
                </Link>
                {getEntityDescription(data) && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {getEntityDescription(data)}
                  </p>
                )}
                <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                  {entityId}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{getEntityTypeLabel(data.type)}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
