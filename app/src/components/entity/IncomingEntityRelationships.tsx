import { keepPreviousData, useQueries } from '@tanstack/react-query'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSearchEntitiesTypedQueryOptions } from '#/api/typedEntitySearch.ts'
import type { SearchEntities200 } from '#/api/models/searchEntities200.ts'
import { auditedEntityId } from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'
import { getIncomingEntityRelationships } from '#/lib/entityRelationships.ts'
import type { IncomingEntityRelationship } from '#/lib/entityRelationships.ts'
import { Button } from '#/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '#/components/ui/card.tsx'
import { EntityReferenceCard } from '#/components/entity/EntityReferenceCard.tsx'

const RELATIONSHIP_PAGE_SIZE = 6

function RelationshipHeading({
  relationship,
  count,
  isLoading = false,
}: {
  relationship: IncomingEntityRelationship
  count?: number
  isLoading?: boolean
}) {
  const { t } = useTranslation()

  return (
    <h2 className="flex items-center gap-1.5 text-base font-semibold">
      <span>{t(`entity.relationships.labels.${relationship.label}`)}</span>
      {count !== undefined && (
        <span className="tabular-nums">({count})</span>
      )}
      {isLoading && (
        <span role="status" className="text-muted-foreground">
          <HugeiconsIcon
            icon={Loading03Icon}
            className="size-4 animate-spin"
            aria-hidden
          />
          <span className="sr-only">{t('common.loading')}</span>
        </span>
      )}
    </h2>
  )
}

function IncomingRelationshipLoading({
  relationship,
}: {
  relationship: IncomingEntityRelationship
}) {
  return (
    <section className="flex flex-col gap-3" aria-busy>
      <RelationshipHeading relationship={relationship} isLoading />
      <Card>
        <CardContent className="grid gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              aria-hidden
              className="flex items-center gap-3 rounded-md bg-muted/25 p-2.5"
            >
              <div className="size-10 shrink-0 animate-pulse rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-3/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

function IncomingRelationshipError({
  relationship,
}: {
  relationship: IncomingEntityRelationship
}) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <RelationshipHeading relationship={relationship} />
      <Card>
        <CardContent className="text-sm text-destructive">
          {t('entity.relationships.load_error')}
        </CardContent>
      </Card>
    </section>
  )
}

function RelationshipPagination({
  page,
  total,
  onPageChange,
}: {
  page: number
  total: number
  onPageChange: (page: number) => void
}) {
  const { t } = useTranslation()
  const totalPages = Math.ceil(total / RELATIONSHIP_PAGE_SIZE)

  if (totalPages === 1) {
    return null
  }

  return (
    <CardFooter className="justify-between gap-3 border-t">
      <p className="text-xs text-muted-foreground">
        {t('common.pagination.range', {
          start: page * RELATIONSHIP_PAGE_SIZE + 1,
          end: Math.min((page + 1) * RELATIONSHIP_PAGE_SIZE, total),
          total,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          isDisabled={page === 0}
          onPress={() => onPageChange(Math.max(0, page - 1))}
        >
          {t('common.pagination.previous_page')}
        </Button>
        <span className="min-w-14 text-center text-xs tabular-nums">
          {t('common.pagination.page_count', {
            page: page + 1,
            total: totalPages,
          })}
        </span>
        <Button
          variant="outline"
          size="sm"
          isDisabled={page + 1 >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          {t('common.pagination.next_page')}
        </Button>
      </div>
    </CardFooter>
  )
}

function IncomingRelationshipCard({
  relationship,
  page,
  data,
  isFetching,
  onPageChange,
}: {
  relationship: IncomingEntityRelationship
  page: number
  data: SearchEntities200
  isFetching: boolean
  onPageChange: (page: number) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <RelationshipHeading
        relationship={relationship}
        count={data.total}
        isLoading={isFetching}
      />
      <Card aria-busy={isFetching}>
        <CardContent className="grid gap-2">
          {data.results.map((entity) => {
            const referencedEntityId = auditedEntityId(entity)
            return (
              <EntityReferenceCard
                key={referencedEntityId}
                entityId={referencedEntityId}
                entity={entity}
              />
            )
          })}
        </CardContent>
        <RelationshipPagination
          page={page}
          total={data.total}
          onPageChange={onPageChange}
        />
      </Card>
    </section>
  )
}

export function IncomingEntityRelationships({
  entityId,
  entityType,
}: {
  entityId: string
  entityType: EntityType
}) {
  const relationships = getIncomingEntityRelationships(entityType)
  const [pages, setPages] = useState<Record<string, number>>({})
  const queryResults = useQueries({
    queries: relationships.map((relationship) => {
      const page = pages[relationship.key] ?? 0
      return getSearchEntitiesTypedQueryOptions(
        {
          facets: [],
          filter: {
            and: [
              {
                field: 'type',
                op: 'eq',
                value: relationship.sourceType,
              },
              {
                field: relationship.path,
                op: 'eq',
                value: entityId,
              },
            ],
          },
          page,
          pageSize: RELATIONSHIP_PAGE_SIZE,
        },
        {
          query: {
            placeholderData: keepPreviousData,
            retry: false,
          },
        },
      )
    }),
  })
  const hasRelationshipSections = queryResults.some(
    (result) =>
      result.isPending || result.isError || (result.data?.total ?? 0) > 0,
  )

  if (!hasRelationshipSections) {
    return null
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      {relationships.map((relationship, index) => {
        const result = queryResults[index]

        if (!result || result.isPending) {
          return (
            <IncomingRelationshipLoading
              key={relationship.key}
              relationship={relationship}
            />
          )
        }

        if (result.isError) {
          return (
            <IncomingRelationshipError
              key={relationship.key}
              relationship={relationship}
            />
          )
        }

        if (!result.data || result.data.total === 0) {
          return null
        }

        return (
          <IncomingRelationshipCard
            key={relationship.key}
            relationship={relationship}
            page={pages[relationship.key] ?? 0}
            data={result.data}
            isFetching={result.isFetching}
            onPageChange={(page) =>
              setPages((current) => ({
                ...current,
                [relationship.key]: page,
              }))
            }
          />
        )
      })}
    </div>
  )
}
