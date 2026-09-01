import { useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { SortDescriptor } from 'react-aria-components'
import type { EntityType } from '@/lib/entity'
import { useAuthStore } from '@/stores/auth'
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

export type UpdateEntityBoardSearch = (
  updates: Partial<{
    q: string
    facetFilters: FacetFilters | undefined
    sort: EntitySort
  }>,
) => void

interface UseEntityBoardStateParams {
  q: string | undefined
  facetFilters: FacetFilters | undefined
  sort: EntitySort | undefined
  updateSearch: UpdateEntityBoardSearch
}

export function useEntityBoardState({
  q,
  facetFilters,
  sort,
  updateSearch,
}: UseEntityBoardStateParams) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))

  const [searchInput, setSearchInput] = useState(q ?? '')
  const [isFacetsDrawerOpen, setIsFacetsDrawerOpen] = useState(false)
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

  return {
    isAuthenticated,
    searchInput,
    setSearchInput,
    searchInputRef,
    tableContainerRef,
    activeSort,
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
  }
}
