import { useMemo } from 'react'
import type { SearchEntities200Facets } from '#/api/models'
import type { FacetFilters } from '#/api/entityBoardSearch.ts'
import { combineEntityRelationshipFacets } from '#/api/entityRelationshipFacets.ts'
import { useEntityReferenceBatch } from '#/api/entityReferenceBatch.ts'
import { ENTITY_TYPES } from '#/lib/entity.ts'

export function useRelationshipFacetPanelData(
  facets: SearchEntities200Facets,
  relationshipFilters: FacetFilters['relationships'],
) {
  const relationshipFacets = useMemo(
    () => combineEntityRelationshipFacets(facets, relationshipFilters),
    [facets, relationshipFilters],
  )
  const relationshipEntityIds = useMemo(
    () =>
      ENTITY_TYPES.flatMap((entityType) =>
        (relationshipFacets[entityType] ?? []).map(({ value }) => value),
      ),
    [relationshipFacets],
  )
  const relationshipReferences = useEntityReferenceBatch(relationshipEntityIds)

  return { relationshipFacets, relationshipReferences }
}
