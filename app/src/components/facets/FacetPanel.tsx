import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchEntities200Facets } from '#/api/models'
import { ENTITY_TYPES, getEntityTypeLabel } from '#/lib/entity.ts'
import { Button } from '#/components/ui/button.tsx'
import { InputGroup, InputGroupInput } from '#/components/ui/input-group.tsx'
import { FacetCheckbox } from './FacetCheckbox.tsx'
import { DEFAULT_FACETS, FACET_VISIBLE_LIMIT } from '../entityBoardSearch.ts'
import type { FacetFilters } from '../entityBoardSearch.ts'

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
    Record<(typeof DEFAULT_FACETS)[number], boolean>
  >({ type: false })
  const [facetSearches, setFacetSearches] = useState<
    Record<(typeof DEFAULT_FACETS)[number], string>
  >({ type: '' })

  const updateFacetValue = (
    field: (typeof DEFAULT_FACETS)[number],
    value: (typeof ENTITY_TYPES)[number],
    isSelected: boolean,
  ) => {
    setDraftFilters((currentFilters) => {
      const currentSelection = currentFilters[field] ?? {}
      const nextValues = new Set(currentSelection.include ?? [])

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
        </div>

        {DEFAULT_FACETS.map((field) => {
          const selection = draftFilters[field] ?? {}
          const countByValue = new Map(
            (facets[field] ?? []).map(({ value, count }) => [value, count]),
          )
          const selectedValues = new Set(selection.include ?? [])
          const values = ENTITY_TYPES.filter(
            (entityType) =>
              countByValue.has(entityType) || selectedValues.has(entityType),
          )
          const normalizedFacetSearch = facetSearches[field]
            .trim()
            .toLocaleLowerCase()
          const filteredValues = normalizedFacetSearch
            ? values.filter((entityType) =>
                getEntityTypeLabel(entityType)
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
            <section key={field} aria-labelledby={`facet-${field}-heading`}>
              <h3
                id={`facet-${field}-heading`}
                className="text-xs font-semibold"
              >
                {t('board.facets.fields.type')}
              </h3>

              <InputGroup className="mt-2">
                <InputGroupInput
                  type="search"
                  value={facetSearches[field]}
                  placeholder={t('board.facets.filter_placeholder')}
                  aria-label={t('board.facets.filter_label', {
                    field: t(`board.facets.fields.${field}`),
                  })}
                  onChange={(event) =>
                    setFacetSearches((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                />
              </InputGroup>

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
                      const nextValues = new Set([
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
                  visibleValues.map((entityType) => {
                    const label = getEntityTypeLabel(entityType)
                    return (
                      <FacetCheckbox
                        key={entityType}
                        label={label}
                        accessibleLabel={t('board.facets.select_value', {
                          value: label,
                        })}
                        entityType={entityType}
                        count={countByValue.get(entityType) ?? 0}
                        isSelected={selection.include?.includes(entityType)}
                        onChange={(selected) =>
                          updateFacetValue(field, entityType, selected)
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
