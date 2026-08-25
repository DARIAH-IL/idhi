import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import {
  getSearchEntitiesQueryKey,
  searchEntities,
} from '#/api/hooks/entities/entities.ts'
import type { EntitySearch, Filter, FilterableField } from '#/api/models'
import { ENTITY_TYPES } from '#/lib/entity.ts'

export const PAGE_SIZE = 20
export const FACET_VISIBLE_LIMIT = 5
export const DEFAULT_FACETS = [
  'type',
] as const satisfies readonly FilterableField[]

const facetSelectionSchema = z.object({
  include: z.array(z.enum(ENTITY_TYPES)).optional(),
})
export const facetFiltersSchema = z.object({
  type: facetSelectionSchema.optional(),
})
export const sortPropertySchema = z.enum([
  'name.value',
  'type',
  'audit.modifiedAt',
])
export const sortSchema = z.object({
  property: sortPropertySchema,
  direction: z.enum(['asc', 'desc']),
})
export const DEFAULT_SORT = {
  property: 'audit.modifiedAt',
  direction: 'desc',
} as const

export type FacetFilters = z.infer<typeof facetFiltersSchema>
export type EntitySort = z.infer<typeof sortSchema>

export const entityBoardSearchSchema = z.object({
  q: z.string().optional(),
  facetFilters: facetFiltersSchema.optional(),
  sort: sortSchema.optional(),
})

export function buildFacetFilter(facetFilters: FacetFilters | undefined) {
  const clauses: Filter[] = []

  for (const field of DEFAULT_FACETS) {
    const selection = facetFilters?.[field]
    if (selection?.include?.length) {
      clauses.push({ field, op: 'in', value: selection.include })
    }
  }

  if (clauses.length === 0) {
    return undefined
  }
  if (clauses.length === 1) {
    return clauses[0]
  }
  return { and: clauses } satisfies Filter
}

export function createEntitySearch(
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

export function getInfiniteEntityQueryOptions(
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
