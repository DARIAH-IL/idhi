import { useCallback, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  infiniteQueryOptions,
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Checkbox } from 'react-aria-components'
import type { SortDescriptor } from 'react-aria-components'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Loading03Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { z } from 'zod'
import {
  getSearchEntitiesQueryKey,
  searchEntities,
} from '@/api/hooks/entities/entities'
import type {
  EntitySearch,
  Filter,
  FilterableField,
  SearchEntities200Facets,
} from '@/api/models'
import {
  ENTITY_TYPES,
  getEntityDisplayName,
  getEntityTypeLabel,
  auditedEntityId,
} from '@/lib/entity'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { EntityImage } from '@/components/entity/EntityImage'
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

const PAGE_SIZE = 20
const FACET_VISIBLE_LIMIT = 5
const DEFAULT_FACETS = ['type'] as const satisfies readonly FilterableField[]
const facetSelectionSchema = z.object({
  include: z.array(z.enum(ENTITY_TYPES)).optional(),
})
const facetFiltersSchema = z.object({
  type: facetSelectionSchema.optional(),
})
const sortPropertySchema = z.enum(['name.value', 'type', 'audit.modifiedAt'])
const sortSchema = z.object({
  property: sortPropertySchema,
  direction: z.enum(['asc', 'desc']),
})
const DEFAULT_SORT = {
  property: 'audit.modifiedAt',
  direction: 'desc',
} as const

type FacetFilters = z.infer<typeof facetFiltersSchema>
type EntitySort = z.infer<typeof sortSchema>

const entityBoardSearchSchema = z.object({
  q: z.string().optional(),
  facetFilters: facetFiltersSchema.optional(),
  sort: sortSchema.optional(),
})

function buildFacetFilter(facetFilters: FacetFilters | undefined) {
  const clauses: Filter[] = []

  for (const field of DEFAULT_FACETS) {
    const selection = facetFilters?.[field]
    if (selection?.include?.length) {
      clauses.push({ field, op: 'in', value: selection.include })
    }
  }

  if (clauses.length === 0) return undefined
  if (clauses.length === 1) return clauses[0]
  return { and: clauses } satisfies Filter
}

function createEntitySearch(
  q: string | undefined,
  facetFilters: FacetFilters | undefined,
  sort: EntitySort | undefined,
): EntitySearch {
  return {
    q,
    facets: [...DEFAULT_FACETS],
    filter: buildFacetFilter(facetFilters),
    sort: [sort ?? DEFAULT_SORT],
    pageSize: PAGE_SIZE,
  }
}

function getInfiniteEntityQueryOptions(
  q: string | undefined,
  facetFilters: FacetFilters | undefined,
  sort: EntitySort | undefined,
) {
  const search = createEntitySearch(q, facetFilters, sort)

  return infiniteQueryOptions({
    queryKey: [...getSearchEntitiesQueryKey(search), 'infinite'] as const,
    queryFn: ({ pageParam, signal }) =>
      searchEntities({ ...search, page: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const nextPage = lastPageParam + 1
      return nextPage * PAGE_SIZE < lastPage.total ? nextPage : undefined
    },
    placeholderData: keepPreviousData,
  })
}

export const Route = createFileRoute('/_app/entities/')({
  validateSearch: entityBoardSearchSchema,
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
    if (!property.success) return

    updateSearch({
      sort: {
        property: property.data,
        direction: descriptor.direction === 'ascending' ? 'asc' : 'desc',
      },
    })
  }

  const clearSearch = () => {
    setSearchInput('')
    if (q) updateSearch({ q: undefined })
    searchInputRef.current?.focus()
  }

  const clearFilters = () => {
    setSearchInput('')
    updateSearch({ q: undefined, facetFilters: undefined })
    searchInputRef.current?.focus()
  }

  const removeFacetFilter = (
    field: (typeof DEFAULT_FACETS)[number],
    value: (typeof ENTITY_TYPES)[number],
  ) => {
    const nextValues = (facetFilters?.[field]?.include ?? []).filter(
      (selectedValue) => selectedValue !== value,
    )
    const nextFacetFilters = { ...facetFilters }

    if (nextValues.length > 0) {
      nextFacetFilters[field] = { include: nextValues }
    } else {
      delete nextFacetFilters[field]
    }

    updateSearch({
      facetFilters:
        Object.keys(nextFacetFilters).length > 0 ? nextFacetFilters : undefined,
    })
  }

  const activeFacetFilters = DEFAULT_FACETS.flatMap((field) =>
    (facetFilters?.[field]?.include ?? []).map((value) => ({ field, value })),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('board.title')}</h1>
        {isAuthenticated && (
          <Link to="/entities/new" className={buttonVariants()}>
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

        {(q || activeFacetFilters.length > 0) && (
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
              const label = getEntityTypeLabel(value)
              const filterLabel = t('board.facets.active_value', {
                field: t(`board.facets.fields.${field}`),
                value: label,
              })

              return (
                <span
                  key={`${field}-${value}`}
                  className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs font-medium"
                >
                  {filterLabel}
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="-me-1 size-4 rounded-full"
                    aria-label={t('board.facets.remove_filter', {
                      filter: filterLabel,
                    })}
                    onPress={() => removeFacetFilter(field, value)}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
        <FacetPanel
          key={JSON.stringify(facetFilters ?? {})}
          facets={facets}
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
          className="min-w-0 space-y-4"
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

          <div className="relative">
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
                containerClassName="max-h-[calc(100vh-12rem)] overflow-y-auto"
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
              >
                <TableHeader>
                  <TableHead id="image" aria-label={t('board.columns.image')} />
                  <TableHead
                    id="name.value"
                    isRowHeader
                    allowsSorting
                    className="cursor-pointer"
                  >
                    <SortableColumnLabel
                      label={t('board.columns.name')}
                      property="name.value"
                      sort={activeSort}
                    />
                  </TableHead>
                  <TableHead id="type" allowsSorting className="cursor-pointer">
                    <SortableColumnLabel
                      label={t('board.columns.type')}
                      property="type"
                      sort={activeSort}
                    />
                  </TableHead>
                  <TableHead
                    id="audit.modifiedAt"
                    allowsSorting
                    className="cursor-pointer"
                  >
                    <SortableColumnLabel
                      label={t('board.columns.modified')}
                      property="audit.modifiedAt"
                      sort={activeSort}
                    />
                  </TableHead>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow id="empty-state" className="hover:bg-transparent">
                      <TableCell
                        colSpan={3}
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
                            <Link
                              to="/entities/$entityId"
                              params={{ entityId: encodeURIComponent(id) }}
                              className="hover:underline font-medium"
                            >
                              {getEntityDisplayName(entity)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getEntityTypeLabel(entity.type)}
                            </Badge>
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
                        if (!isFetchingNextPage) void fetchNextPage()
                      }}
                    >
                      {t('common.loading')}
                    </TableLoadMoreItem>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function SortableColumnLabel({
  label,
  property,
  sort,
}: {
  label: string
  property: EntitySort['property']
  sort: EntitySort
}) {
  const direction = sort.property === property ? sort.direction : undefined

  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {direction && (
        <HugeiconsIcon
          icon={direction === 'asc' ? ArrowUp01Icon : ArrowDown01Icon}
          className="size-3.5"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

interface FacetPanelProps {
  facets: SearchEntities200Facets
  initialFilters: FacetFilters
  isLoading: boolean
  isRefetching: boolean
  onApply: (facetFilters: FacetFilters) => void
}

function FacetPanel({
  facets,
  initialFilters,
  isLoading,
  isRefetching,
  onApply,
}: FacetPanelProps) {
  const { t } = useTranslation()
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [expandedFacets, setExpandedFacets] = useState<
    Record<(typeof DEFAULT_FACETS)[number], boolean>
  >({ type: false })
  const [facetSearches, setFacetSearches] = useState<
    Record<(typeof DEFAULT_FACETS)[number], string>
  >({ type: '' })

  const updateFacetValue = (
    field: (typeof DEFAULT_FACETS)[number],
    value: (typeof ENTITY_TYPES)[number],
    isSelected: boolean,
  ) => {
    setDraftFilters((currentFilters) => {
      const currentSelection = currentFilters[field] ?? {}
      const nextValues = new Set(currentSelection.include ?? [])

      if (isSelected) {
        nextValues.add(value)
      } else {
        nextValues.delete(value)
      }

      if (nextValues.size === 0) {
        const remainingFilters = { ...currentFilters }
        delete remainingFilters[field]
        return remainingFilters
      }

      return {
        ...currentFilters,
        [field]: { include: [...nextValues] },
      }
    })
  }

  return (
    <aside className="self-start rounded-lg border bg-muted/20 md:sticky md:top-4">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">{t('board.facets.title')}</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 border-b pb-4">
          <Button
            className="w-full"
            isDisabled={Object.keys(draftFilters).length === 0}
            onPress={() => onApply(draftFilters)}
          >
            {t('board.facets.apply')}
          </Button>
        </div>

        {DEFAULT_FACETS.map((field) => {
          const selection = draftFilters[field] ?? {}
          const countByValue = new Map(
            (facets[field] ?? []).map(({ value, count }) => [value, count]),
          )
          const selectedValues = new Set(selection.include ?? [])
          const values = ENTITY_TYPES.filter(
            (entityType) =>
              countByValue.has(entityType) || selectedValues.has(entityType),
          )
          const normalizedFacetSearch = facetSearches[field]
            .trim()
            .toLocaleLowerCase()
          const filteredValues = normalizedFacetSearch
            ? values.filter((entityType) =>
                getEntityTypeLabel(entityType)
                  .toLocaleLowerCase()
                  .includes(normalizedFacetSearch),
              )
            : values
          const isExpanded = expandedFacets[field]
          const visibleValues = isExpanded
            ? filteredValues
            : filteredValues.slice(0, FACET_VISIBLE_LIMIT)
          const canToggleExpansion = filteredValues.length > FACET_VISIBLE_LIMIT
          const isSelectAllDisabled =
            filteredValues.length === 0 ||
            filteredValues.every((value) => selectedValues.has(value))

          return (
            <section key={field} aria-labelledby={`facet-${field}-heading`}>
              <h3
                id={`facet-${field}-heading`}
                className="text-xs font-semibold"
              >
                {t('board.facets.fields.type')}
              </h3>

              <InputGroup className="mt-2">
                <InputGroupInput
                  type="search"
                  value={facetSearches[field]}
                  placeholder={t('board.facets.filter_placeholder')}
                  aria-label={t('board.facets.filter_label', {
                    field: t(`board.facets.fields.${field}`),
                  })}
                  onChange={(event) =>
                    setFacetSearches((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                />
              </InputGroup>

              <div
                role="group"
                aria-label={t('board.facets.bulk_actions')}
                className="mt-2 grid grid-cols-2 rounded-md bg-muted p-0.5"
              >
                <Button
                  size="xs"
                  variant="ghost"
                  isDisabled={isSelectAllDisabled}
                  onPress={() =>
                    setDraftFilters((currentFilters) => {
                      const nextValues = new Set([
                        ...(currentFilters[field]?.include ?? []),
                        ...filteredValues,
                      ])
                      return {
                        ...currentFilters,
                        [field]: { include: [...nextValues] },
                      }
                    })
                  }
                >
                  {t('board.facets.select_all')}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  isDisabled={selectedValues.size === 0}
                  onPress={() =>
                    setDraftFilters((currentFilters) => {
                      const remainingFilters = { ...currentFilters }
                      delete remainingFilters[field]
                      return remainingFilters
                    })
                  }
                >
                  {t('board.facets.clear_all')}
                </Button>
              </div>

              <div
                className={`mt-2 grid gap-0.5 ${isRefetching ? 'opacity-50 transition-opacity duration-150' : ''}`}
              >
                {isLoading ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.loading')}
                  </p>
                ) : values.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.no_values')}
                  </p>
                ) : filteredValues.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.no_matching_values')}
                  </p>
                ) : (
                  visibleValues.map((entityType) => {
                    const label = getEntityTypeLabel(entityType)
                    return (
                      <FacetCheckbox
                        key={entityType}
                        label={label}
                        accessibleLabel={t('board.facets.select_value', {
                          value: label,
                        })}
                        entityType={entityType}
                        count={countByValue.get(entityType) ?? 0}
                        isSelected={selection.include?.includes(entityType)}
                        onChange={(selected) =>
                          updateFacetValue(field, entityType, selected)
                        }
                      />
                    )
                  })
                )}
              </div>

              {canToggleExpansion && (
                <Button
                  size="xs"
                  variant="ghost"
                  className="mt-1 w-full"
                  aria-expanded={isExpanded}
                  onPress={() =>
                    setExpandedFacets((current) => ({
                      ...current,
                      [field]: !current[field],
                    }))
                  }
                >
                  {t(
                    isExpanded
                      ? 'board.facets.show_less'
                      : 'board.facets.show_more',
                  )}
                </Button>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}

interface FacetCheckboxProps {
  label: string
  accessibleLabel: string
  entityType: (typeof ENTITY_TYPES)[number]
  count: number
  isSelected?: boolean
  onChange: (isSelected: boolean) => void
}

function FacetCheckbox({
  label,
  accessibleLabel,
  entityType,
  count,
  isSelected,
  onChange,
}: FacetCheckboxProps) {
  return (
    <Checkbox
      aria-label={accessibleLabel}
      isSelected={isSelected}
      onChange={onChange}
      className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      {({ isSelected: selected }) => (
        <>
          <span
            className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background'
            }`}
          >
            {selected && (
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2.5}
                className="size-3"
                aria-hidden="true"
              />
            )}
          </span>
          <EntityTypeIcon
            type={entityType}
            size="sm"
            className="size-5 shrink-0 bg-transparent"
          />
          <span className="min-w-0 truncate text-xs">{label}</span>
          <span className="ms-auto text-xs tabular-nums text-muted-foreground">
            {count}
          </span>
        </>
      )}
    </Checkbox>
  )
}
