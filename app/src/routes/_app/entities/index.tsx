import { useCallback, useRef, useState } from 'react'
import { JumpToTop } from '@/components/JumpToTop'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { SortDescriptor } from 'react-aria-components'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Cancel01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import {
  getEntityDisplayName,
  getEntityFieldLabelText,
  getEntityTypeLabel,
  getEntityTypePluralLabel,
  auditedEntityId,
} from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import { DraftBadge } from '@/components/entity/DraftBadge'
import { EntityImage } from '@/components/entity/EntityImage'
import { EntityTags } from '@/components/entity/EntityTags'
import { getEntityTypeColorClass } from '@/components/entity/EntityTypeIcon'
import { TimeAgo } from '@/components/TimeAgo'
import { useAuthStore } from '@/stores/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLoadMoreItem,
  TableRow,
} from '@/components/ui/table'
import {
  entityBoardSearchSchema,
  sortPropertySchema,
  DEFAULT_SORT,
  getInfiniteEntityQueryOptions,
  getFacetFieldLabel,
  getFacetValueLabel,
} from '../../../api/entityBoardSearch.ts'
import { restoreOrPersistEntityBoardSearch } from '../../../lib/entityBoardSearchStorage.ts'
import type {
  FacetField,
  FacetFilters,
  EntitySort,
} from '../../../api/entityBoardSearch.ts'
import { SortableColumnLabel } from '../../../components/facets/SortableColumnLabel.tsx'
import { FacetPanel } from '../../../components/facets/FacetPanel.tsx'
import { ActiveFilterChip } from '../../../components/facets/ActiveFilterChip.tsx'
import { useRelationshipFacetPanelData } from '../../../api/useRelationshipFacetPanelData.ts'
import {
  getActiveFacetFilters,
  getActiveRelationshipFacetFilters,
  removeFacetFilterValue,
  removeRelationshipFacetFilterValue,
} from '../../../lib/facetFilterMutations.ts'

export const Route = createFileRoute('/_app/entities/')({
  validateSearch: entityBoardSearchSchema,
  beforeLoad: ({ search, cause }) => {
    restoreOrPersistEntityBoardSearch({ search, cause })
  },
  loaderDeps: ({ search: { q, facetFilters, sort } }) => ({
    q,
    facetFilters,
    sort,
  }),
  loader: ({ context, deps }) => {
    void context.queryClient.prefetchInfiniteQuery(
      getInfiniteEntityQueryOptions(deps.q, deps.facetFilters, deps.sort),
    )
  },
  component: EntityBoard,
})

function EntityBoard() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, facetFilters, sort } = Route.useSearch()

  const [searchInput, setSearchInput] = useState(q ?? '')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const activeSort = sort ?? DEFAULT_SORT
  const sortDescriptor: SortDescriptor = {
    column: activeSort.property,
    direction: activeSort.direction === 'asc' ? 'ascending' : 'descending',
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery(getInfiniteEntityQueryOptions(q, facetFilters, sort))
  const isRefetching = isFetching && !isLoading && !isFetchingNextPage
  const results = data?.pages.flatMap((resultPage) => resultPage.results) ?? []
  const total = data?.pages[0]?.total ?? 0
  const facets = data?.pages[0]?.facets ?? {}
  const { relationshipFacets, relationshipReferences } =
    useRelationshipFacetPanelData(facets, facetFilters?.relationships)

  const updateSearch = useCallback(
    (
      updates: Partial<{
        q: string
        facetFilters: FacetFilters | undefined
        sort: EntitySort
      }>,
    ) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate],
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch({ q: searchInput || undefined })
  }

  const handleSortChange = (descriptor: SortDescriptor) => {
    const property = sortPropertySchema.safeParse(descriptor.column)
    if (!property.success) {
      return
    }

    updateSearch({
      sort: {
        property: property.data,
        direction: descriptor.direction === 'ascending' ? 'asc' : 'desc',
      },
    })
  }

  const clearSearch = () => {
    setSearchInput('')
    if (q) {
      updateSearch({ q: undefined })
    }
    searchInputRef.current?.focus()
  }

  const clearFilters = () => {
    setSearchInput('')
    updateSearch({ q: undefined, facetFilters: undefined })
    searchInputRef.current?.focus()
  }

  const removeFacetFilter = (field: FacetField, value: string) => {
    updateSearch({
      facetFilters: removeFacetFilterValue(facetFilters, field, value),
    })
  }

  const removeRelationshipFacetFilter = (
    targetType: EntityType,
    value: string,
  ) => {
    updateSearch({
      facetFilters: removeRelationshipFacetFilterValue(
        facetFilters,
        targetType,
        value,
      ),
    })
  }

  const activeFacetFilters = getActiveFacetFilters(facetFilters)
  const activeRelationshipFacetFilters =
    getActiveRelationshipFacetFilters(facetFilters)

  return (
    <div className="flex flex-col gap-4 md:h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('board.title')}</h1>
        {isAuthenticated && (
          <Link to="/entities/new" className={buttonVariants()}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            {t('board.new_entity')}
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <InputGroup className="max-w-sm">
            <InputGroupInput
              ref={searchInputRef}
              type="search"
              placeholder={t('board.search_placeholder')}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="[&::-webkit-search-cancel-button]:hidden"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={t('board.clear_search')}
                isDisabled={!searchInput}
                onPress={clearSearch}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button type="submit" variant="outline" size="default">
            {t('board.search_action')}
          </Button>
        </form>

        {(q ||
          activeFacetFilters.length > 0 ||
          activeRelationshipFacetFilters.length > 0) && (
          <div
            className="flex flex-wrap gap-1.5"
            aria-label={t('board.facets.active_filters')}
          >
            <Button
              size="xs"
              variant="outline"
              className="h-5 rounded-full border-dashed px-2 text-xs"
              onPress={clearFilters}
            >
              {t('board.clear_filters')}
            </Button>

            {activeFacetFilters.map(({ field, value }) => {
              const filterLabel = t('board.facets.active_value', {
                field: getFacetFieldLabel(field),
                value: getFacetValueLabel(field, value),
              })

              return (
                <ActiveFilterChip
                  key={`${field}-${value}`}
                  filterLabel={filterLabel}
                  onRemove={() => removeFacetFilter(field, value)}
                />
              )
            })}

            {activeRelationshipFacetFilters.map(({ targetType, value }) => {
              const entity = relationshipReferences.entitiesById.get(value)
              const filterLabel = t('board.facets.active_value', {
                field: t('board.facets.referenced_type', {
                  type: getEntityTypePluralLabel(targetType),
                }),
                value: entity ? getEntityDisplayName(entity) : value,
              })

              return (
                <ActiveFilterChip
                  key={`${targetType}-${value}`}
                  filterLabel={filterLabel}
                  onRemove={() =>
                    removeRelationshipFacetFilter(targetType, value)
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 md:min-h-0 md:flex-1 md:grid-cols-[16rem_minmax(0,1fr)]">
        <FacetPanel
          key={JSON.stringify(facetFilters ?? {})}
          facets={facets}
          relationshipFacets={relationshipFacets}
          relationshipEntitiesById={relationshipReferences.entitiesById}
          areRelationshipNamesLoading={relationshipReferences.isLoading}
          initialFilters={facetFilters ?? {}}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onApply={(nextFacetFilters) =>
            updateSearch({
              q: searchInput || undefined,
              facetFilters:
                Object.keys(nextFacetFilters).length > 0
                  ? nextFacetFilters
                  : undefined,
            })
          }
        />

        <section
          aria-label={t('board.results_label')}
          className="min-w-0 space-y-4 md:flex md:h-full md:min-h-0 md:flex-col"
          aria-busy={isFetching}
        >
          {isError && (
            <p className="text-sm text-destructive">{t('common.error')}</p>
          )}

          {data && (
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {t('board.loaded_count', {
                loaded: results.length,
                total,
              })}
            </p>
          )}

          <div className="relative md:min-h-0 md:flex-1">
            {(isLoading || isRefetching) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
                <div
                  role="status"
                  className="flex flex-col items-center gap-3 text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    strokeWidth={2}
                    className="size-6 animate-spin"
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
                containerRef={tableContainerRef}
                containerClassName="max-h-[calc(100vh-12rem)] overflow-y-auto md:max-h-full"
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
              >
                <TableHeader>
                  <TableHead
                    id="image"
                    aria-label={getEntityFieldLabelText('Person', 'image')}
                  />
                  <TableHead
                    id="name.value"
                    isRowHeader
                    allowsSorting
                    className="cursor-pointer"
                  >
                    <SortableColumnLabel
                      label={getEntityFieldLabelText('Organization', 'name')}
                      property="name.value"
                      sort={activeSort}
                    />
                  </TableHead>
                  <TableHead id="type" allowsSorting className="cursor-pointer">
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
                    className="cursor-pointer"
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
                          q || Object.keys(facetFilters ?? {}).length > 0
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
                          onAction={() =>
                            void navigate({
                              to: '/entities/$entityId',
                              params: { entityId: encodeURIComponent(id) },
                            })
                          }
                          className="cursor-pointer"
                        >
                          <TableCell className="w-12">
                            <EntityImage
                              image={entity.image}
                              type={entity.type}
                              alt={getEntityDisplayName(entity)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Link
                                to="/entities/$entityId"
                                params={{ entityId: encodeURIComponent(id) }}
                                className="hover:underline font-medium"
                              >
                                {getEntityDisplayName(entity)}
                              </Link>
                              <DraftBadge isDraft={entity.isDraft} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={getEntityTypeColorClass(entity.type)}
                            >
                              {getEntityTypeLabel(entity.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1">
                              <EntityTags
                                tags={entity.tags}
                                separator={false}
                              />
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
                          void fetchNextPage()
                        }
                      }}
                    >
                      {t('common.loading')}
                    </TableLoadMoreItem>
                  )}
                </TableBody>
              </Table>
            )}
            {!isLoading && <JumpToTop scrollRef={tableContainerRef} />}
          </div>
        </section>
      </div>
    </div>
  )
}
