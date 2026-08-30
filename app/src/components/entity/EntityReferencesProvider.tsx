import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchEntitiesTyped,
  getSearchEntitiesTypedQueryKey,
} from '#/api/typedEntitySearch.ts'
import type { TypedEntitySearch } from '#/api/typedEntitySearch.ts'
import type { AuditedEntity } from '#/api/models/auditedEntity.ts'
import { auditedEntityId } from '#/lib/entity.ts'

const REFERENCE_PAGE_SIZE = 20

interface EntityReferencesState {
  entityIds: ReadonlySet<string>
  entitiesById: ReadonlyMap<string, AuditedEntity>
  isLoading: boolean
}

const EntityReferencesContext = createContext<EntityReferencesState | null>(
  null,
)

export function EntityReferencesProvider({
  entityIds,
  children,
}: {
  entityIds: string[]
  children: ReactNode
}) {
  const search: TypedEntitySearch = {
    facets: [],
    filter: { field: 'id', op: 'in', value: entityIds },
    pageSize: REFERENCE_PAGE_SIZE,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [...getSearchEntitiesTypedQueryKey(search), 'infinite'],
    queryFn: ({ client, pageParam, signal }) =>
      fetchEntitiesTyped(client, { ...search, page: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (total, page) => total + page.results.length,
        0,
      )
      return lastPage.results.length > 0 && loaded < lastPage.total
        ? pages.length
        : undefined
    },
    enabled: entityIds.length > 0,
    retry: false,
  })

  useEffect(() => {
    if (!isError && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isError, isFetchingNextPage])

  const entities = data?.pages.flatMap((page) => page.results) ?? []

  const value: EntityReferencesState = {
    entityIds: new Set(entityIds),
    entitiesById: new Map(
      entities.map((entity) => [auditedEntityId(entity), entity]),
    ),
    isLoading: !isError && (isLoading || hasNextPage || isFetchingNextPage),
  }

  return (
    <EntityReferencesContext.Provider value={value}>
      {children}
    </EntityReferencesContext.Provider>
  )
}

export function useEntityReferences(): EntityReferencesState | null {
  return useContext(EntityReferencesContext)
}
