import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { SearchEntities200Facets } from '#/api/models'
import { ENTITY_TYPES, normalizeEntityType } from '#/lib/entity.ts'
import { Button } from '#/components/ui/button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group.tsx'
import { FacetCheckbox } from './FacetCheckbox.tsx'
import {
  DEFAULT_FACETS,
  FACET_VISIBLE_LIMIT,
  getFacetFieldLabel,
  getFacetValueLabel,
} from '../../api/entityBoardSearch.ts'
import type { FacetField, FacetFilters } from '../../api/entityBoardSearch.ts'

interface FacetPanelProps {
  facets: SearchEntities200Facets
  initialFilters: FacetFilters
  isLoading: boolean
  isRefetching: boolean
  onApply: (facetFilters: FacetFilters) => void
}

export function FacetPanel({
  facets,
  initialFilters,
  isLoading,
  isRefetching,
  onApply,
}: FacetPanelProps) {
  const { t } = useTranslation()
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [expandedFacets, setExpandedFacets] = useState<
    Record<FacetField, boolean>
  >({ type: false, tags: false })
  const [facetSearch, setFacetSearch] = useState('')

  const updateFacetValue = (
    field: FacetField,
    value: string,
    isSelected: boolean,
  ) => {
    setDraftFilters((currentFilters) => {
      const currentSelection = currentFilters[field] ?? {}
      const nextValues = new Set<string>(currentSelection.include ?? [])

      if (isSelected) {
        nextValues.add(value)
      } else {
        nextValues.delete(value)
      }

      if (nextValues.size === 0) {
        const remainingFilters = { ...currentFilters }
        delete remainingFilters[field]
        return remainingFilters
      }

      return {
        ...currentFilters,
        [field]: { include: [...nextValues] },
      }
    })
  }

  return (
    <aside className="self-start rounded-lg border bg-muted/20 md:max-h-full md:overflow-y-auto">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">{t('board.facets.title')}</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 border-b pb-4">
          <Button
            className="w-full"
            isDisabled={Object.keys(draftFilters).length === 0}
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
          const selection = draftFilters[field] ?? {}
          const countByValue = new Map(
            (facets[field] ?? []).map(({ value, count }) => [
              field === 'type' ? (normalizeEntityType(value) ?? value) : value,
              count,
            ]),
          )
          const selectedValues = new Set<string>(selection.include ?? [])
          const values: string[] =
            field === 'type'
              ? ENTITY_TYPES.filter(
                  (entityType) =>
                    countByValue.has(entityType) ||
                    selectedValues.has(entityType),
                )
              : [...new Set([...countByValue.keys(), ...selectedValues])]
          const normalizedFacetSearch = facetSearch.trim().toLocaleLowerCase()
          const filteredValues = normalizedFacetSearch
            ? values.filter((value) =>
                getFacetValueLabel(field, value)
                  .toLocaleLowerCase()
                  .includes(normalizedFacetSearch),
              )
            : values
          const isExpanded = expandedFacets[field]
          const visibleValues = isExpanded
            ? filteredValues
            : filteredValues.slice(0, FACET_VISIBLE_LIMIT)
          const canToggleExpansion = filteredValues.length > FACET_VISIBLE_LIMIT
          const isSelectAllDisabled =
            filteredValues.length === 0 ||
            filteredValues.every((value) => selectedValues.has(value))

          return (
            <section
              key={field}
              aria-labelledby={`facet-${field}-heading`}
              className="border-b pb-4 [&+&]:mt-4 last:border-b-0 last:pb-0"
            >
              <h3
                id={`facet-${field}-heading`}
                className="text-xs font-semibold"
              >
                {getFacetFieldLabel(field)}
              </h3>

              <div
                role="group"
                aria-label={t('board.facets.bulk_actions')}
                className="mt-2 grid grid-cols-2 rounded-md bg-muted p-0.5"
              >
                <Button
                  size="xs"
                  variant="ghost"
                  isDisabled={isSelectAllDisabled}
                  onPress={() =>
                    setDraftFilters((currentFilters) => {
                      const nextValues = new Set<string>([
                        ...(currentFilters[field]?.include ?? []),
                        ...filteredValues,
                      ])
                      return {
                        ...currentFilters,
                        [field]: { include: [...nextValues] },
                      }
                    })
                  }
                >
                  {t('board.facets.select_all')}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  isDisabled={selectedValues.size === 0}
                  onPress={() =>
                    setDraftFilters((currentFilters) => {
                      const remainingFilters = { ...currentFilters }
                      delete remainingFilters[field]
                      return remainingFilters
                    })
                  }
                >
                  {t('board.facets.clear_all')}
                </Button>
              </div>

              <div
                className={`mt-2 grid gap-0.5 ${isRefetching ? 'opacity-50 transition-opacity duration-150' : ''}`}
              >
                {isLoading ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.loading')}
                  </p>
                ) : values.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.no_values')}
                  </p>
                ) : filteredValues.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-muted-foreground">
                    {t('board.facets.no_matching_values')}
                  </p>
                ) : (
                  visibleValues.map((value) => {
                    const label = getFacetValueLabel(field, value)
                    return (
                      <FacetCheckbox
                        key={value}
                        label={label}
                        accessibleLabel={t('board.facets.select_value', {
                          value: label,
                        })}
                        entityType={
                          field === 'type'
                            ? normalizeEntityType(value)
                            : undefined
                        }
                        count={countByValue.get(value) ?? 0}
                        isSelected={selectedValues.has(value)}
                        onChange={(selected) =>
                          updateFacetValue(field, value, selected)
                        }
                      />
                    )
                  })
                )}
              </div>

              {canToggleExpansion && (
                <Button
                  size="xs"
                  variant="ghost"
                  className="mt-1 w-full"
                  aria-expanded={isExpanded}
                  onPress={() =>
                    setExpandedFacets((current) => ({
                      ...current,
                      [field]: !current[field],
                    }))
                  }
                >
                  {t(
                    isExpanded
                      ? 'board.facets.show_less'
                      : 'board.facets.show_more',
                  )}
                </Button>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
