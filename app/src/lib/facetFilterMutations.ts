import { DEFAULT_FACETS } from '#/api/entityBoardSearch.ts'
import type { FacetField, FacetFilters } from '#/api/entityBoardSearch.ts'
import { ENTITY_TYPES } from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'

export function getActiveFacetFilters(
  facetFilters: FacetFilters | undefined,
): { field: FacetField; value: string }[] {
  return DEFAULT_FACETS.flatMap((field) =>
    (facetFilters?.[field]?.include ?? []).map((value) => ({ field, value })),
  )
}

export function getActiveRelationshipFacetFilters(
  facetFilters: FacetFilters | undefined,
): { targetType: EntityType; value: string }[] {
  return ENTITY_TYPES.flatMap((targetType) =>
    (facetFilters?.relationships?.[targetType]?.include ?? []).map((value) => ({
      targetType,
      value,
    })),
  )
}

export function removeFacetFilterValue(
  facetFilters: FacetFilters | undefined,
  field: FacetField,
  value: string,
): FacetFilters | undefined {
  const nextFacetFilters = { ...facetFilters }

  if (field === 'type') {
    const nextValues = (facetFilters?.type?.include ?? []).filter(
      (selectedValue) => selectedValue !== value,
    )
    if (nextValues.length > 0) {
      nextFacetFilters.type = { include: nextValues }
    } else {
      delete nextFacetFilters.type
    }
  } else {
    const nextValues = (facetFilters?.[field]?.include ?? []).filter(
      (selectedValue) => selectedValue !== value,
    )
    if (nextValues.length > 0) {
      nextFacetFilters[field] = { include: nextValues }
    } else {
      delete nextFacetFilters[field]
    }
  }

  return Object.keys(nextFacetFilters).length > 0 ? nextFacetFilters : undefined
}

export function removeRelationshipFacetFilterValue(
  facetFilters: FacetFilters | undefined,
  targetType: EntityType,
  value: string,
): FacetFilters | undefined {
  const nextFacetFilters = { ...facetFilters }
  const nextRelationships = { ...facetFilters?.relationships }
  const nextValues = (
    facetFilters?.relationships?.[targetType]?.include ?? []
  ).filter((selectedValue) => selectedValue !== value)

  if (nextValues.length > 0) {
    nextRelationships[targetType] = { include: nextValues }
  } else {
    delete nextRelationships[targetType]
  }

  if (Object.keys(nextRelationships).length > 0) {
    nextFacetFilters.relationships = nextRelationships
  } else {
    delete nextFacetFilters.relationships
  }

  return Object.keys(nextFacetFilters).length > 0 ? nextFacetFilters : undefined
}
