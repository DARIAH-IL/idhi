import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import {
  fetchEntitiesTyped,
  getSearchEntitiesTypedQueryKey,
} from '#/api/typedEntitySearch.ts'
import type {
  EntityField,
  EntityFilter,
  TypedEntitySearch,
} from '#/api/typedEntitySearch.ts'
import {
  ENTITY_TYPES,
  getEntityFieldLabelText,
  getEntityTypeFromId,
  getEntityTypeLabel,
} from '#/lib/entity.ts'
import {
  getEntityRelationshipFacetDefinitions,
  getEntityRelationshipFacetPaths,
} from '#/lib/entityRelationships.ts'

export const PAGE_SIZE = 20
export const FACET_VISIBLE_LIMIT = 5
export const DEFAULT_FACETS = [
  'type',
  'tags',
] as const satisfies readonly EntityField[]

export type FacetField = (typeof DEFAULT_FACETS)[number]

const facetSelectionSchema = z.object({
  include: z.array(z.string()).optional(),
})

export const facetFiltersSchema = z.object({
  type: z
    .object({
      include: z.array(z.enum(ENTITY_TYPES)).optional(),
    })
    .optional(),
  tags: facetSelectionSchema.optional(),
  relationships: z
    .partialRecord(z.enum(ENTITY_TYPES), facetSelectionSchema)
    .optional(),
})

export function getFacetValueLabel(field: FacetField, value: string): string {
  return field === 'type' ? getEntityTypeLabel(value) : value
}

export function getFacetFieldLabel(field: FacetField): string {
  return getEntityFieldLabelText('Person', field)
}
const SORT_PROPERTIES = [
  'name.value',
  'type',
  'audit.modifiedAt',
] as const satisfies readonly EntityField[]
export const sortPropertySchema = z.enum(SORT_PROPERTIES)
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

export type EntityBoardSearch = z.infer<typeof entityBoardSearchSchema>

export function buildFacetFilter(facetFilters: FacetFilters | undefined) {
  const clauses: EntityFilter[] = []

  for (const field of DEFAULT_FACETS) {
    const selection = facetFilters?.[field]
    if (selection?.include?.length) {
      clauses.push({ field, op: 'in', value: selection.include })
    }
  }

  for (const { targetType, paths } of getEntityRelationshipFacetDefinitions()) {
    const selectedIds = (
      facetFilters?.relationships?.[targetType]?.include ?? []
    ).filter((entityId) => getEntityTypeFromId(entityId) === targetType)
    if (selectedIds.length === 0) {
      continue
    }

    const relationshipClauses = paths.map((field): EntityFilter => ({
      field,
      op: 'in',
      value: selectedIds,
    }))
    const [firstRelationshipClause, ...remainingRelationshipClauses] =
      relationshipClauses
    if (!firstRelationshipClause) {
      continue
    }
    clauses.push(
      remainingRelationshipClauses.length === 0
        ? firstRelationshipClause
        : {
            or: [firstRelationshipClause, ...remainingRelationshipClauses],
          },
    )
  }

  if (clauses.length === 0) {
    return undefined
  }
  if (clauses.length === 1) {
    return clauses[0]
  }
  return { and: clauses } satisfies EntityFilter
}

export function createEntitySearch(
  q: string | undefined,
  facetFilters: FacetFilters | undefined,
  sort: EntitySort | undefined,
): TypedEntitySearch {
  const sourceTypes = facetFilters?.type?.include

  return {
    q,
    facets: [
      ...DEFAULT_FACETS,
      ...getEntityRelationshipFacetPaths(
        sourceTypes?.length ? sourceTypes : undefined,
      ),
    ],
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
    queryKey: [...getSearchEntitiesTypedQueryKey(search), 'infinite'] as const,
    queryFn: ({ client, pageParam, signal }) =>
      fetchEntitiesTyped(
        client,
        {
          ...search,
          facets: pageParam === 0 ? search.facets : [],
          page: pageParam,
        },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const nextPage = lastPageParam + 1
      return nextPage * PAGE_SIZE < lastPage.total ? nextPage : undefined
    },
    placeholderData: keepPreviousData,
  })
}
