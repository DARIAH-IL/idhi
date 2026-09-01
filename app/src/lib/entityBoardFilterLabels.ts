import type { TFunction } from 'i18next'
import type { AuditedEntity } from '@/api/models'
import type { FacetField } from '@/api/entityBoardSearch.ts'
import {
  getFacetFieldLabel,
  getFacetValueLabel,
} from '@/api/entityBoardSearch.ts'
import type { EntityType } from '@/lib/entity'
import { getEntityDisplayName, getEntityTypePluralLabel } from '@/lib/entity'

export function getActiveFacetFilterLabel(
  t: TFunction,
  field: FacetField,
  value: string,
) {
  return t('board.facets.active_value', {
    field: getFacetFieldLabel(field),
    value: getFacetValueLabel(field, value),
  })
}

export function getActiveRelationshipFacetFilterLabel(
  t: TFunction,
  targetType: EntityType,
  value: string,
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>,
) {
  const entity = relationshipEntitiesById.get(value)
  return t('board.facets.active_value', {
    field: t('board.facets.referenced_type', {
      type: getEntityTypePluralLabel(targetType),
    }),
    value: entity ? getEntityDisplayName(entity) : value,
  })
}
