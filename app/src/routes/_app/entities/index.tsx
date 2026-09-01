import { useCallback } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import {
  entityBoardSearchSchema,
  getInfiniteEntityQueryOptions,
} from '../../../api/entityBoardSearch.ts'
import type { FacetFilters } from '../../../api/entityBoardSearch.ts'
import { compileAdvancedFilter } from '../../../lib/advancedFilterTree.ts'
import { EntityBoardSearchBar } from '@/components/board/EntityBoardSearchBar.tsx'
import { ActiveFacetFiltersBar } from '@/components/board/ActiveFacetFiltersBar.tsx'
import { AdvancedSearchPanel } from '@/components/board/AdvancedSearchPanel.tsx'
import { AdvancedSearchToggleButton } from '@/components/board/AdvancedSearchToggleButton.tsx'
import { EntityFacetsDrawer } from '@/components/board/EntityFacetsDrawer.tsx'
import { EntityFacetsDesktopPanel } from '@/components/board/EntityFacetsDesktopPanel.tsx'
import { EntityResultsTable } from '@/components/board/EntityResultsTable.tsx'
import { useEntityBoardState } from '@/hooks/useEntityBoardState.ts'
import type { UpdateEntityBoardSearch } from '@/hooks/useEntityBoardState.ts'
import { restoreOrPersistEntityBoardSearch } from '../../../lib/entityBoardSearchStorage.ts'

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
    const advancedFilter = compileAdvancedFilter(
      useUIStore.getState().advancedSearchFilter,
    )
    void context.queryClient.prefetchInfiniteQuery(
      getInfiniteEntityQueryOptions(
        deps.q,
        deps.facetFilters,
        deps.sort,
        advancedFilter,
      ),
    )
  },
  component: EntityBoard,
})

function EntityBoard() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, facetFilters, sort } = Route.useSearch()

  const updateSearch: UpdateEntityBoardSearch = useCallback(
    (updates) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate],
  )

  const {
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
  } = useEntityBoardState({ q, facetFilters, sort, updateSearch })

  const applyFacetFilters = (nextFacetFilters: FacetFilters) =>
    updateSearch({
      q: searchInput || undefined,
      facetFilters:
        Object.keys(nextFacetFilters).length > 0 ? nextFacetFilters : undefined,
    })

  const isAdvancedSearchVisible =
    !advancedSearchCollapsed || advancedFilterActiveCount > 0

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
        <EntityBoardSearchBar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSubmit={handleSearchSubmit}
          searchInputRef={searchInputRef}
          onClearSearch={clearSearch}
        >
          <EntityFacetsDrawer
            facets={facets}
            relationshipFacets={relationshipFacets}
            relationshipEntitiesById={relationshipReferences.entitiesById}
            areRelationshipNamesLoading={relationshipReferences.isLoading}
            facetFilters={facetFilters}
            isLoading={isLoading}
            isRefetching={isRefetching}
            isOpen={isFacetsDrawerOpen}
            onOpenChange={setIsFacetsDrawerOpen}
            onApply={applyFacetFilters}
          />
          <AdvancedSearchToggleButton
            isVisible={isAdvancedSearchVisible}
            activeCount={advancedFilterActiveCount}
            onToggle={() =>
              setAdvancedSearchCollapsed(!advancedSearchCollapsed)
            }
          />
        </EntityBoardSearchBar>

        <ActiveFacetFiltersBar
          q={q}
          activeFacetFilters={activeFacetFilters}
          activeRelationshipFacetFilters={activeRelationshipFacetFilters}
          relationshipEntitiesById={relationshipReferences.entitiesById}
          onClearFilters={clearFilters}
          onRemoveFacetFilter={removeFacetFilter}
          onRemoveRelationshipFacetFilter={removeRelationshipFacetFilter}
        />

        <AdvancedSearchPanel
          filter={advancedSearchFilterNode}
          activeCount={advancedFilterActiveCount}
          isCollapsed={!isAdvancedSearchVisible}
          onApply={setAdvancedSearchFilterNode}
          onClear={clearAdvancedFilter}
        />
      </div>

      <div className="grid items-start gap-6 md:min-h-0 md:flex-1 md:grid-cols-[16rem_minmax(0,1fr)]">
        <EntityFacetsDesktopPanel
          facets={facets}
          relationshipFacets={relationshipFacets}
          relationshipEntitiesById={relationshipReferences.entitiesById}
          areRelationshipNamesLoading={relationshipReferences.isLoading}
          facetFilters={facetFilters}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onApply={applyFacetFilters}
        />

        <EntityResultsTable
          results={results}
          total={total}
          hasResultsLoaded={Boolean(data)}
          q={q}
          facetFilters={facetFilters}
          hasAdvancedFilter={advancedFilterActiveCount > 0}
          isError={isError}
          isLoading={isLoading}
          isRefetching={isRefetching}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onFetchNextPage={() => void fetchNextPage()}
          activeSort={activeSort}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          tableContainerRef={tableContainerRef}
          onOpenEntity={(id) =>
            void navigate({
              to: '/entities/$entityId',
              params: { entityId: encodeURIComponent(id) },
            })
          }
        />
      </div>
    </div>
  )
}
