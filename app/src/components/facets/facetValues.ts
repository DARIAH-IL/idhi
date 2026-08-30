import type { AuditedEntity, SearchEntities200Facets } from '#/api/models'
import type { EntityRelationshipFacets } from '#/api/entityRelationshipFacets.ts'
import type { FacetField } from '#/api/entityBoardSearch.ts'
import { getFacetValueLabel } from '#/api/entityBoardSearch.ts'
import {
  ENTITY_TYPES,
  getEntityDisplayName,
  normalizeEntityType,
} from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'

export interface FacetValue {
  value: string
  label: string
  count: number
  entityType?: EntityType
}

export function buildStaticFacetValues(
  field: FacetField,
  facets: SearchEntities200Facets,
  selectedValues: ReadonlySet<string>,
): FacetValue[] {
  const countByValue = new Map(
    (facets[field] ?? []).map(({ value, count }) => [
      field === 'type' ? (normalizeEntityType(value) ?? value) : value,
      count,
    ]),
  )

  if (field === 'type') {
    return ENTITY_TYPES.filter(
      (entityType) =>
        countByValue.has(entityType) || selectedValues.has(entityType),
    ).map((value) => ({
      value,
      label: getFacetValueLabel(field, value),
      count: countByValue.get(value) ?? 0,
      entityType: value,
    }))
  }

  return [...new Set([...countByValue.keys(), ...selectedValues])].map(
    (value) => ({
      value,
      label: getFacetValueLabel(field, value),
      count: countByValue.get(value) ?? 0,
    }),
  )
}

export function buildRelationshipFacetValues(
  targetType: EntityType,
  relationshipFacets: EntityRelationshipFacets,
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>,
): FacetValue[] {
  return (relationshipFacets[targetType] ?? []).map(({ value, count }) => {
    const entity = relationshipEntitiesById.get(value)
    return {
      value,
      label: entity ? getEntityDisplayName(entity) : value,
      count,
      entityType: targetType,
    }
  })
}

export function getRelationshipFacetKey(targetType: EntityType): string {
  return `relationship-${targetType}`
}
