import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { SortDescriptor } from 'react-aria-components'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import type { AuditedEntity } from '@/api/models'
import type { EntitySort, FacetFilters } from '@/api/entityBoardSearch.ts'
import { getFacetFieldLabel } from '@/api/entityBoardSearch.ts'
import {
  auditedEntityId,
  getEntityDisplayName,
  getEntityFieldLabelText,
  getEntityTypeLabel,
} from '@/lib/entity'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DraftBadge } from '@/components/entity/DraftBadge'
import { EntityImage } from '@/components/entity/EntityImage'
import { EntityTags } from '@/components/entity/EntityTags'
import { getEntityTypeColorClass } from '@/components/entity/EntityTypeIcon'
import { TimeAgo } from '@/components/TimeAgo'
import { JumpToTop } from '@/components/JumpToTop'
import { SortableColumnLabel } from '@/components/facets/SortableColumnLabel.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLoadMoreItem,
  TableRow,
} from '@/components/ui/table'

interface EntityResultsTableProps {
  results: AuditedEntity[]
  total: number
  hasResultsLoaded: boolean
  q: string | undefined
  facetFilters: FacetFilters | undefined
  hasAdvancedFilter: boolean
  isError: boolean
  isLoading: boolean
  isRefetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onFetchNextPage: () => void
  activeSort: EntitySort | undefined
  sortDescriptor: SortDescriptor
  onSortChange: (descriptor: SortDescriptor) => void
  tableContainerRef: RefObject<HTMLDivElement | null>
  onOpenEntity: (id: string) => void
}

export function EntityResultsTable({
  results,
  total,
  hasResultsLoaded,
  q,
  facetFilters,
  hasAdvancedFilter,
  isError,
  isLoading,
  isRefetching,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  activeSort,
  sortDescriptor,
  onSortChange,
  tableContainerRef,
  onOpenEntity,
}: EntityResultsTableProps) {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('board.results_label')}
      className="flex min-h-0 min-w-0 flex-col space-y-4"
    >
      {isError && (
        <p role="alert" className="text-sm text-destructive">
          {t('common.error')}
        </p>
      )}

      <p
        aria-live="polite"
        className={
          hasResultsLoaded && results.length === 0
            ? 'sr-only'
            : 'text-xs text-muted-foreground'
        }
      >
        {hasResultsLoaded
          ? results.length === 0
            ? t(
                q ||
                  Object.keys(facetFilters ?? {}).length > 0 ||
                  hasAdvancedFilter
                  ? 'board.no_matching_results'
                  : 'board.no_results',
              )
            : t('board.loaded_count', {
                loaded: results.length,
                total,
              })
          : ''}
      </p>

      <div className="relative min-h-0 flex-1">
        {(isLoading || isRefetching) && (
          <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/80">
            <div
              role="status"
              className="flex flex-col items-center gap-3 text-muted-foreground mt-12 md:mt-32"
            >
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="size-6 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <p className="text-sm">{t('common.loading')}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="min-h-64" />
        ) : (
          <Table
            aria-label={t('board.results_label')}
            className="table-fixed"
            containerRef={tableContainerRef}
            containerClassName="h-full overflow-y-auto"
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
          >
            <TableHeader>
              <TableHead
                id="image"
                aria-label={getEntityFieldLabelText('Person', 'image')}
                className="w-14"
              />
              <TableHead
                id="name.value"
                isRowHeader
                allowsSorting
                className="w-[30%] cursor-pointer"
              >
                <SortableColumnLabel
                  label={getEntityFieldLabelText('Organization', 'name')}
                  property="name.value"
                  sort={activeSort}
                />
              </TableHead>
              <TableHead
                id="type"
                allowsSorting
                className="w-36 cursor-pointer"
              >
                <SortableColumnLabel
                  label={getFacetFieldLabel('type')}
                  property="type"
                  sort={activeSort}
                />
              </TableHead>
              <TableHead id="tags">{getFacetFieldLabel('tags')}</TableHead>
              <TableHead
                id="audit.modifiedAt"
                allowsSorting
                className="w-32 cursor-pointer"
              >
                <SortableColumnLabel
                  label={t('entity.detail.modified')}
                  property="audit.modifiedAt"
                  sort={activeSort}
                />
              </TableHead>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow id="empty-state" className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {t(
                      q ||
                        Object.keys(facetFilters ?? {}).length > 0 ||
                        hasAdvancedFilter
                        ? 'board.no_matching_results'
                        : 'board.no_results',
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                results.map((entity) => {
                  const id = auditedEntityId(entity)
                  return (
                    <TableRow
                      key={id}
                      id={id}
                      onAction={() => onOpenEntity(id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <EntityImage
                          image={entity.image}
                          type={entity.type}
                          alt=""
                          entityId={id}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Link
                            to="/entities/$entityId"
                            params={{ entityId: encodeURIComponent(id) }}
                            className="truncate hover:underline font-medium"
                          >
                            {getEntityDisplayName(entity)}
                          </Link>
                          <DraftBadge isDraft={entity.isDraft} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'max-w-full truncate',
                            getEntityTypeColorClass(entity.type),
                          )}
                        >
                          {getEntityTypeLabel(entity.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <EntityTags tags={entity.tags} separator={false} />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <TimeAgo date={entity.audit?.modifiedAt} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {hasNextPage && (
                <TableLoadMoreItem
                  isLoading={isFetchingNextPage}
                  onLoadMore={() => {
                    if (!isFetchingNextPage) {
                      onFetchNextPage()
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      strokeWidth={2}
                      className="size-3.5 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    {t('common.loading_more')}
                  </span>
                </TableLoadMoreItem>
              )}
            </TableBody>
          </Table>
        )}
        {!isLoading && <JumpToTop scrollRef={tableContainerRef} />}
      </div>
    </section>
  )
}
