import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons'
import type { AuditedEntity, SearchEntities200Facets } from '@/api/models'
import type { EntityRelationshipFacets } from '@/api/entityRelationshipFacets.ts'
import type { FacetFilters } from '@/api/entityBoardSearch.ts'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { FacetPanel } from '@/components/facets/FacetPanel.tsx'

interface EntityFacetsDrawerProps {
  facets: SearchEntities200Facets
  relationshipFacets: EntityRelationshipFacets
  relationshipEntitiesById: ReadonlyMap<string, AuditedEntity>
  areRelationshipNamesLoading: boolean
  facetFilters: FacetFilters | undefined
  isLoading: boolean
  isRefetching: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onApply: (nextFacetFilters: FacetFilters) => void
}

export function EntityFacetsDrawer({
  facets,
  relationshipFacets,
  relationshipEntitiesById,
  areRelationshipNamesLoading,
  facetFilters,
  isLoading,
  isRefetching,
  isOpen,
  onOpenChange,
  onApply,
}: EntityFacetsDrawerProps) {
  const { t } = useTranslation()

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerTrigger
        render={
          <Button type="button" variant="outline" className="md:hidden">
            <HugeiconsIcon
              icon={FilterIcon}
              strokeWidth={2}
              aria-hidden="true"
            />
            {t('board.facets.open')}
          </Button>
        }
      />
      <DrawerContent className="rounded-none m-0 [&_aside]:rounded-none">
        <DrawerTitle className="sr-only">{t('board.facets.title')}</DrawerTitle>
        <div className="relative flex-1 overflow-y-auto">
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 end-2 z-10"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="sr-only">{t('common.close')}</span>
              </Button>
            }
          />
          <FacetPanel
            key={JSON.stringify(facetFilters ?? {})}
            facets={facets}
            relationshipFacets={relationshipFacets}
            relationshipEntitiesById={relationshipEntitiesById}
            areRelationshipNamesLoading={areRelationshipNamesLoading}
            initialFilters={facetFilters ?? {}}
            isLoading={isLoading}
            isRefetching={isRefetching}
            onApply={(nextFacetFilters) => {
              onOpenChange(false)
              onApply(nextFacetFilters)
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
