import type { AuditedEntity, SearchEntities200Facets } from '@/api/models'
import type { EntityRelationshipFacets } from '@/api/entityRelationshipFacets.ts'
import type { FacetFilters } from '@/api/entityBoardSearch.ts'
import { FacetPanel } from '@/components/facets/FacetPanel.tsx'

interface EntityFacetsDesktopPanelProps {
  facets: SearchEntities200Facets
  relationshipFacets: EntityRelationshipFacets
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>
  areRelationshipNamesLoading: boolean
  facetFilters: FacetFilters | undefined
  isLoading: boolean
  isRefetching: boolean
  onApply: (nextFacetFilters: FacetFilters) => void
}

export function EntityFacetsDesktopPanel({
  facets,
  relationshipFacets,
  relationshipEntitiesById,
  areRelationshipNamesLoading,
  facetFilters,
  isLoading,
  isRefetching,
  onApply,
}: EntityFacetsDesktopPanelProps) {
  return (
    <div className="hidden md:block">
      <FacetPanel
        key={JSON.stringify(facetFilters ?? {})}
        facets={facets}
        relationshipFacets={relationshipFacets}
        relationshipEntitiesById={relationshipEntitiesById}
        areRelationshipNamesLoading={areRelationshipNamesLoading}
        initialFilters={facetFilters ?? {}}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onApply={onApply}
      />
    </div>
  )
}
