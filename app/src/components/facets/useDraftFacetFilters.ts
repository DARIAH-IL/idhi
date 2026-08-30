import { useState } from 'react'
import type { FacetField, FacetFilters } from '#/api/entityBoardSearch.ts'
import type { EntityType } from '#/lib/entity.ts'

export function useDraftFacetFilters(initialFilters: FacetFilters) {
  const [draftFilters, setDraftFilters] = useState(initialFilters)

  const setFieldValues = (field: FacetField, values: string[]) => {
    setDraftFilters((currentFilters) => {
      if (values.length === 0) {
        const remainingFilters = { ...currentFilters }
        delete remainingFilters[field]
        return remainingFilters
      }

      return {
        ...currentFilters,
        [field]: { include: values },
      }
    })
  }

  const updateFieldValue = (
    field: FacetField,
    value: string,
    isSelected: boolean,
  ) => {
    const nextValues = new Set(draftFilters[field]?.include ?? [])
    if (isSelected) {
      nextValues.add(value)
    } else {
      nextValues.delete(value)
    }
    setFieldValues(field, [...nextValues])
  }

  const setRelationshipValues = (targetType: EntityType, values: string[]) => {
    setDraftFilters((currentFilters) => {
      const relationships = { ...currentFilters.relationships }
      if (values.length === 0) {
        delete relationships[targetType]
      } else {
        relationships[targetType] = { include: values }
      }

      if (Object.keys(relationships).length === 0) {
        const { relationships: _relationships, ...remainingFilters } =
          currentFilters
        return remainingFilters
      }

      return { ...currentFilters, relationships }
    })
  }

  const updateRelationshipValue = (
    targetType: EntityType,
    value: string,
    isSelected: boolean,
  ) => {
    const nextValues = new Set(
      draftFilters.relationships?.[targetType]?.include ?? [],
    )
    if (isSelected) {
      nextValues.add(value)
    } else {
      nextValues.delete(value)
    }
    setRelationshipValues(targetType, [...nextValues])
  }

  return {
    draftFilters,
    setFieldValues,
    updateFieldValue,
    setRelationshipValues,
    updateRelationshipValue,
  }
}
