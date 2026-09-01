import { useTranslation } from 'react-i18next'
import type { AuditedEntity } from '@/api/models'
import type { FacetField } from '@/api/entityBoardSearch.ts'
import type { EntityType } from '@/lib/entity'
import { Button } from '@/components/ui/button'
import { ActiveFilterChip } from '@/components/facets/ActiveFilterChip.tsx'
import {
  getActiveFacetFilterLabel,
  getActiveRelationshipFacetFilterLabel,
} from '@/lib/entityBoardFilterLabels.ts'

interface ActiveFacetFiltersBarProps {
  q: string | undefined
  activeFacetFilters: { field: FacetField; value: string }[]
  activeRelationshipFacetFilters: { targetType: EntityType; value: string }[]
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>
  onClearFilters: () => void
  onRemoveFacetFilter: (field: FacetField, value: string) => void
  onRemoveRelationshipFacetFilter: (
    targetType: EntityType,
    value: string,
  ) => void
}

export function ActiveFacetFiltersBar({
  q,
  activeFacetFilters,
  activeRelationshipFacetFilters,
  relationshipEntitiesById,
  onClearFilters,
  onRemoveFacetFilter,
  onRemoveRelationshipFacetFilter,
}: ActiveFacetFiltersBarProps) {
  const { t } = useTranslation()

  if (
    !q &&
    activeFacetFilters.length === 0 &&
    activeRelationshipFacetFilters.length === 0
  ) {
    return null
  }

  return (
    <div
      role="group"
      className="flex flex-wrap gap-1.5"
      aria-label={t('board.facets.active_filters')}
    >
      <Button
        size="xs"
        variant="outline"
        className="h-5 rounded-full border-dashed px-2 text-xs"
        onPress={onClearFilters}
      >
        {t('board.clear_filters')}
      </Button>

      {activeFacetFilters.map(({ field, value }) => (
        <ActiveFilterChip
          key={`${field}-${value}`}
          filterLabel={getActiveFacetFilterLabel(t, field, value)}
          onRemove={() => onRemoveFacetFilter(field, value)}
        />
      ))}

      {activeRelationshipFacetFilters.map(({ targetType, value }) => (
        <ActiveFilterChip
          key={`${targetType}-${value}`}
          filterLabel={getActiveRelationshipFacetFilterLabel(
            t,
            targetType,
            value,
            relationshipEntitiesById,
          )}
          onRemove={() => onRemoveRelationshipFacetFilter(targetType, value)}
        />
      ))}
    </div>
  )
}
