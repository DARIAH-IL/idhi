import type {
  SearchEntities200Facets,
  SearchEntities200FacetsItem,
} from '#/api/models'
import type { FacetFilters } from '#/api/entityBoardSearch.ts'
import { getEntityTypeFromId } from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'
import { getEntityRelationshipFacetDefinitions } from '#/lib/entityRelationships.ts'

export const RELATIONSHIP_FACET_VALUES_LIMIT = 100

export type EntityRelationshipFacets = Partial<
  Record<EntityType, SearchEntities200FacetsItem[]>
>

export function combineEntityRelationshipFacets(
  facets: SearchEntities200Facets,
  relationshipFilters: FacetFilters['relationships'],
): EntityRelationshipFacets {
  const combinedFacets: EntityRelationshipFacets = {}

  for (const { targetType, paths } of getEntityRelationshipFacetDefinitions()) {
    const countByEntityId = new Map<string, number>()
    for (const path of paths) {
      for (const { value, count } of facets[path] ?? []) {
        if (getEntityTypeFromId(value) !== targetType) {
          continue
        }
        countByEntityId.set(value, (countByEntityId.get(value) ?? 0) + count)
      }
    }

    const selectedIds = new Set(
      (relationshipFilters?.[targetType]?.include ?? []).filter(
        (entityId) => getEntityTypeFromId(entityId) === targetType,
      ),
    )
    const sortedValues = [...countByEntityId]
      .map(([value, count]) => ({ value, count }))
      .sort(
        (left, right) =>
          right.count - left.count || left.value.localeCompare(right.value),
      )
    const limitedValues = sortedValues.slice(0, RELATIONSHIP_FACET_VALUES_LIMIT)
    const includedIds = new Set(limitedValues.map(({ value }) => value))

    for (const selectedId of selectedIds) {
      if (!includedIds.has(selectedId)) {
        limitedValues.push({
          value: selectedId,
          count: countByEntityId.get(selectedId) ?? 0,
        })
      }
    }

    if (limitedValues.length > 0) {
      combinedFacets[targetType] = limitedValues
    }
  }

  return combinedFacets
}
