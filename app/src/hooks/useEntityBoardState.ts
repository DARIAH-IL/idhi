import { useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { SortDescriptor } from 'react-aria-components'
import type { AuditedEntity } from '@/api/models'
import { auditedEntityId } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import type { FilterGroupNode } from '@/lib/advancedFilterTree'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import {
  DEFAULT_SORT,
  getInfiniteEntityQueryOptions,
  sortPropertySchema,
} from '@/api/entityBoardSearch.ts'
import type {
  EntitySort,
  FacetField,
  FacetFilters,
} from '@/api/entityBoardSearch.ts'
import { useRelationshipFacetPanelData } from '@/api/useRelationshipFacetPanelData.ts'
import {
  getActiveFacetFilters,
  getActiveRelationshipFacetFilters,
  removeFacetFilterValue,
  removeRelationshipFacetFilterValue,
} from '@/lib/facetFilterMutations.ts'
import {
  compileAdvancedFilter,
  countActiveConditions,
} from '@/lib/advancedFilterTree.ts'

const reportedDuplicateEntityIds = new Set<string>()

function reportDuplicateEntityIds(duplicateIds: string[]) {
  const unreportedIds = duplicateIds.filter(
    (entityId) => !reportedDuplicateEntityIds.has(entityId),
  )
  if (unreportedIds.length === 0) {
    return
  }

  for (const entityId of unreportedIds) {
    reportedDuplicateEntityIds.add(entityId)
  }

  // eslint-disable-next-line no-console
  console.error(
    'Entity search returned the same id on more than one page, which means offset pagination is unstable. Duplicate rows were dropped to keep the results collection valid.',
    { duplicateIds: unreportedIds },
  )
}

export type UpdateEntityBoardSearch = (
  updates: Partial<{
    q: string
    facetFilters: FacetFilters | undefined
    sort: EntitySort
    advancedFilter: FilterGroupNode | undefined
  }>,
) => void

interface UseEntityBoardStateParams {
  q: string | undefined
  facetFilters: FacetFilters | undefined
  sort: EntitySort | undefined
  advancedSearchFilterNode: FilterGroupNode | undefined
  updateSearch: UpdateEntityBoardSearch
}

export function useEntityBoardState({
  q,
  facetFilters,
  sort,
  advancedSearchFilterNode,
  updateSearch,
}: UseEntityBoardStateParams) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))

  const [searchInput, setSearchInput] = useState(q ?? '')
  const [isFacetsDrawerOpen, setIsFacetsDrawerOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const setAdvancedSearchFilterNode = (
    advancedFilterNode: FilterGroupNode | undefined,
  ) => updateSearch({ advancedFilter: advancedFilterNode })
  const advancedSearchCollapsed = useUIStore(
    (state) => state.advancedSearchCollapsed,
  )
  const setAdvancedSearchCollapsed = useUIStore(
    (state) => state.setAdvancedSearchCollapsed,
  )
  const advancedFilter = useMemo(
    () => compileAdvancedFilter(advancedSearchFilterNode),
    [advancedSearchFilterNode],
  )
  const advancedFilterActiveCount = useMemo(
    () => countActiveConditions(advancedSearchFilterNode),
    [advancedSearchFilterNode],
  )
  const clearAdvancedFilter = () => setAdvancedSearchFilterNode(undefined)

  const sortDescriptor: SortDescriptor = {
    column: (sort ?? DEFAULT_SORT).property,
    direction:
      (sort ?? DEFAULT_SORT).direction === 'asc' ? 'ascending' : 'descending',
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery(
    getInfiniteEntityQueryOptions(q, facetFilters, sort, advancedFilter),
  )
  const isRefetching = isFetching && !isLoading && !isFetchingNextPage
  const results = useMemo(() => {
    const entitiesById = new Map<string, AuditedEntity>()
    const duplicateIds: string[] = []

    for (const resultPage of data?.pages ?? []) {
      for (const entity of resultPage.results) {
        const entityId = auditedEntityId(entity)
        if (entitiesById.has(entityId)) {
          duplicateIds.push(entityId)
        }
        entitiesById.set(entityId, entity)
      }
    }

    reportDuplicateEntityIds(duplicateIds)

    return [...entitiesById.values()]
  }, [data])
  const total = data?.pages[0]?.total ?? 0
  const facets = data?.pages[0]?.facets ?? {}
  const { relationshipFacets, relationshipReferences } =
    useRelationshipFacetPanelData(facets, facetFilters?.relationships)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch({ q: searchInput || undefined })
  }

  const handleSortChange = (descriptor: SortDescriptor) => {
    const property = sortPropertySchema.safeParse(descriptor.column)
    if (!property.success) {
      return
    }

    if (!sort || sort.property !== property.data) {
      updateSearch({ sort: { property: property.data, direction: 'asc' } })
      return
    }

    if (sort.direction === 'asc') {
      updateSearch({ sort: { property: property.data, direction: 'desc' } })
      return
    }

    updateSearch({ sort: undefined })
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

  return {
    isAuthenticated,
    searchInput,
    setSearchInput,
    searchInputRef,
    tableContainerRef,
    activeSort: sort,
    sortDescriptor,
    data,
    results,
    total,
    facets,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isRefetching,
    relationshipFacets,
    relationshipReferences,
    isFacetsDrawerOpen,
    setIsFacetsDrawerOpen,
    handleSearchSubmit,
    handleSortChange,
    clearSearch,
    clearFilters,
    removeFacetFilter,
    removeRelationshipFacetFilter,
    activeFacetFilters,
    activeRelationshipFacetFilters,
    advancedSearchFilterNode,
    setAdvancedSearchFilterNode,
    advancedFilterActiveCount,
    clearAdvancedFilter,
    advancedSearchCollapsed,
    setAdvancedSearchCollapsed,
  }
}
