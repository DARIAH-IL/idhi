import { Link } from '@tanstack/react-router'
import { Focusable } from 'react-aria-components'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getGetEntityByIdQueryOptions } from '@/api/hooks/entities/entities'
import { Card, CardContent } from '@/components/ui/card'
import { EntityTags } from '@/components/entity/EntityTags'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import {
  getEntityDescription,
  getEntityDescriptionLanguage,
  getEntityDisplayName,
  getEntityDisplayNameLanguage,
  getEntityTypeLabel,
} from '@/lib/entity'
import { langStringDir } from '@/components/LangStringValue'
import { getEntityTermUri } from '@/api/termUris/termUri'
import { EntityNameIdentifiers } from './EntityNameIdentifiers'
import { EntityImage } from './EntityImage'
import { DraftBadge } from './DraftBadge'
import { useEntityReferences } from './EntityReferencesProvider'
import { cn } from '@/lib/utils'
import type { AuditedEntity } from '#/api/models/auditedEntity.ts'

export function EntityReferenceCard({
  entityId,
  entity: providedEntity,
  className,
  titleLinkOnly = false,
}: {
  entityId: string
  entity?: AuditedEntity
  className?: string
  titleLinkOnly?: boolean
}) {
  const { t } = useTranslation()
  const references = useEntityReferences()
  const isBatchRequested =
    providedEntity === undefined &&
    (references?.entityIds.has(entityId) ?? false)
  const entityQuery = useQuery(
    getGetEntityByIdQueryOptions(entityId, {
      query: {
        enabled: providedEntity === undefined && !isBatchRequested,
        retry: false,
      },
    }),
  )

  let data = providedEntity
  let isLoading = false

  if (isBatchRequested) {
    data = references?.entitiesById.get(entityId)
    isLoading = data === undefined && (references?.isLoading ?? false)
  } else if (providedEntity === undefined) {
    data = entityQuery.data
    isLoading = entityQuery.isLoading
  }

  if (isLoading || data === undefined) {
    return (
      <Card size="sm" className="bg-muted/20">
        <CardContent className="p-2.5">
          {isLoading ? (
            <span role="status" className="text-xs text-muted-foreground">
              {t('common.loading')}
            </span>
          ) : (
            <span role="alert" className="text-xs text-destructive">
              {t('entity.reference.unavailable')}
            </span>
          )}
        </CardContent>
      </Card>
    )
  }

  const description = getEntityDescription(data)
  const descriptionLanguage = getEntityDescriptionLanguage(data)
  const displayNameLanguage = getEntityDisplayNameLanguage(data)
  const term = getEntityTermUri(data.type)

  const card = (
    <Card
      role="button"
      size="sm"
      className={cn(
        'relative bg-muted/20 hover:bg-accent-foreground/10',
        className,
      )}
    >
      {!titleLinkOnly && (
        <Link
          to="/entities/$entityId"
          params={{ entityId: encodeURIComponent(entityId) }}
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0"
        />
      )}
      <CardContent className="p-2.5">
        <div className="flex items-center gap-3">
          <EntityImage image={data.image} type={data.type} alt="" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <EntityNameIdentifiers entity={data} className="relative">
              <span className="flex items-center gap-1.5">
                <Link
                  to="/entities/$entityId"
                  params={{ entityId: encodeURIComponent(entityId) }}
                  lang={displayNameLanguage}
                  dir={langStringDir(displayNameLanguage)}
                  className="text-sm font-semibold hover:underline"
                >
                  {getEntityDisplayName(data)}
                </Link>
                <DraftBadge isDraft={data.isDraft} />
              </span>
            </EntityNameIdentifiers>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{getEntityTypeLabel(data.type)}</span>
              <EntityTags tags={data.tags} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!description) {
    return card
  }

  return (
    <TooltipTrigger>
      <Focusable>{card}</Focusable>
      <Tooltip className="flex-col items-start gap-0.5">
        <span
          lang={descriptionLanguage}
          dir={langStringDir(descriptionLanguage)}
          className="block text-start"
        >
          {description}
        </span>
        {term && (
          <span className="font-mono text-[0.625rem] opacity-70">{term}</span>
        )}
      </Tooltip>
    </TooltipTrigger>
  )
}
