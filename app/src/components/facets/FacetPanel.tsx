import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { AuditedEntity, SearchEntities200Facets } from '#/api/models'
import type { EntityRelationshipFacets } from '#/api/entityRelationshipFacets.ts'
import { ENTITY_TYPES, getEntityTypePluralLabel } from '#/lib/entity.ts'
import { Button } from '#/components/ui/button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group.tsx'
import { useToggleMap } from '#/hooks/useToggleMap.ts'
import { useUIStore } from '#/stores/ui.ts'
import { FacetSection } from './FacetSection.tsx'
import {
  buildRelationshipFacetValues,
  buildStaticFacetValues,
  getRelationshipFacetKey,
} from './facetValues.ts'
import { useDraftFacetFilters } from './useDraftFacetFilters.ts'
import {
  DEFAULT_FACETS,
  getFacetFieldLabel,
} from '../../api/entityBoardSearch.ts'
import type { FacetFilters } from '../../api/entityBoardSearch.ts'

interface FacetPanelProps {
  facets: SearchEntities200Facets
  relationshipFacets: EntityRelationshipFacets
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>
  areRelationshipNamesLoading: boolean
  initialFilters: FacetFilters
  isLoading: boolean
  isRefetching: boolean
  onApply: (facetFilters: FacetFilters) => void
}

export function FacetPanel({
  facets,
  relationshipFacets,
  relationshipEntitiesById,
  areRelationshipNamesLoading,
  initialFilters,
  isLoading,
  isRefetching,
  onApply,
}: FacetPanelProps) {
  const { t } = useTranslation()
  const {
    draftFilters,
    setFieldValues,
    updateFieldValue,
    setRelationshipValues,
    updateRelationshipValue,
  } = useDraftFacetFilters(initialFilters)
  const [expandedValues, toggleValuesExpanded] = useToggleMap()
  const collapsedFacets = useUIStore((state) => state.collapsedFacets)
  const toggleCollapsed = useUIStore((state) => state.toggleFacetCollapsed)
  const [facetSearch, setFacetSearch] = useState('')
  const instanceId = useId()
  const isDirty =
    JSON.stringify(draftFilters) !== JSON.stringify(initialFilters)

  return (
    <aside
      aria-label={t('board.facets.title')}
      className="self-start rounded-lg border bg-muted/20 md:max-h-full md:overflow-y-auto"
    >
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">{t('board.facets.title')}</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 border-b pb-4">
          <Button
            className="w-full"
            isDisabled={!isDirty}
            onPress={() => onApply(draftFilters)}
          >
            {t('board.facets.apply')}
          </Button>

          <InputGroup className="mt-2">
            <InputGroupInput
              type="search"
              value={facetSearch}
              placeholder={t('board.facets.filter_placeholder')}
              aria-label={t('board.facets.filter_label')}
              onChange={(event) => setFacetSearch(event.target.value)}
              className="[&::-webkit-search-cancel-button]:hidden"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={t('board.clear_search')}
                isDisabled={!facetSearch}
                onPress={() => setFacetSearch('')}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {DEFAULT_FACETS.map((field) => {
          const selectedValues = new Set<string>(
            draftFilters[field]?.include ?? [],
          )
          const values = buildStaticFacetValues(field, facets, selectedValues)

          return (
            <FacetSection
              key={field}
              idPrefix={instanceId}
              facetKey={field}
              label={getFacetFieldLabel(field)}
              values={values}
              selectedValues={selectedValues}
              facetSearch={facetSearch}
              isValuesExpanded={Boolean(expandedValues[field])}
              isCollapsed={Boolean(collapsedFacets[field])}
              isLoading={isLoading}
              isRefetching={isRefetching}
              onChange={(value, selected) =>
                updateFieldValue(field, value, selected)
              }
              onSelectAll={(visibleValues) =>
                setFieldValues(field, [
                  ...new Set([...selectedValues, ...visibleValues]),
                ])
              }
              onClearAll={() => setFieldValues(field, [])}
              onToggleValuesExpanded={() => toggleValuesExpanded(field)}
              onToggleCollapsed={() => toggleCollapsed(field)}
            />
          )
        })}

        {ENTITY_TYPES.map((targetType) => {
          const values = buildRelationshipFacetValues(
            targetType,
            relationshipFacets,
            relationshipEntitiesById,
          )
          if (values.length === 0) {
            return null
          }

          const selectedValues = new Set(
            draftFilters.relationships?.[targetType]?.include ?? [],
          )
          const facetKey = getRelationshipFacetKey(targetType)

          return (
            <FacetSection
              key={facetKey}
              idPrefix={instanceId}
              facetKey={facetKey}
              label={t('board.facets.referenced_type', {
                type: getEntityTypePluralLabel(targetType),
              })}
              values={values}
              selectedValues={selectedValues}
              facetSearch={facetSearch}
              isValuesExpanded={Boolean(expandedValues[facetKey])}
              isCollapsed={Boolean(collapsedFacets[facetKey])}
              isLoading={isLoading}
              isRefetching={isRefetching}
              areLabelsLoading={areRelationshipNamesLoading}
              onChange={(value, selected) =>
                updateRelationshipValue(targetType, value, selected)
              }
              onSelectAll={(visibleValues) =>
                setRelationshipValues(targetType, [
                  ...new Set([...selectedValues, ...visibleValues]),
                ])
              }
              onClearAll={() => setRelationshipValues(targetType, [])}
              onToggleValuesExpanded={() => toggleValuesExpanded(facetKey)}
              onToggleCollapsed={() => toggleCollapsed(facetKey)}
            />
          )
        })}
      </div>
    </aside>
  )
}
