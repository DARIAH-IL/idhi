import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { Button } from '#/components/ui/button.tsx'
import { FACET_VISIBLE_LIMIT } from '#/api/entityBoardSearch.ts'
import type { FacetValue } from './facetValues.ts'
import { FacetCheckbox } from './FacetCheckbox.tsx'

interface FacetSectionProps {
  facetKey: string
  label: string
  values: FacetValue[]
  selectedValues: ReadonlySet<string>
  facetSearch: string
  isValuesExpanded: boolean
  isCollapsed: boolean
  isLoading: boolean
  isRefetching: boolean
  areLabelsLoading?: boolean
  onChange: (value: string, isSelected: boolean) => void
  onSelectAll: (values: string[]) => void
  onClearAll: () => void
  onToggleValuesExpanded: () => void
  onToggleCollapsed: () => void
}

export function FacetSection({
  facetKey,
  label,
  values,
  selectedValues,
  facetSearch,
  isValuesExpanded,
  isCollapsed,
  isLoading,
  isRefetching,
  areLabelsLoading = false,
  onChange,
  onSelectAll,
  onClearAll,
  onToggleValuesExpanded,
  onToggleCollapsed,
}: FacetSectionProps) {
  const { t } = useTranslation()
  const normalizedFacetSearch = facetSearch.trim().toLocaleLowerCase()
  const filteredValues = normalizedFacetSearch
    ? values.filter(({ label: valueLabel }) =>
        valueLabel.toLocaleLowerCase().includes(normalizedFacetSearch),
      )
    : values
  const visibleValues = isValuesExpanded
    ? filteredValues
    : filteredValues.slice(0, FACET_VISIBLE_LIMIT)
  const canToggleExpansion = filteredValues.length > FACET_VISIBLE_LIMIT
  const isSelectAllDisabled =
    filteredValues.length === 0 ||
    filteredValues.every(({ value }) => selectedValues.has(value))
  const isContentLoading = isLoading || areLabelsLoading
  const headingId = `facet-${facetKey}-heading`
  const bodyId = `facet-${facetKey}-body`

  return (
    <section
      aria-labelledby={headingId}
      className="border-b pb-4 [&+&]:mt-4 last:border-b-0 last:pb-0"
    >
      <h3 id={headingId} className="text-xs font-semibold">
        <Button
          variant="ghost"
          className="-ms-1.5 h-auto w-full justify-start gap-1.5 px-1.5 py-1 text-xs font-semibold"
          aria-expanded={!isCollapsed}
          aria-controls={bodyId}
          onPress={onToggleCollapsed}
        >
          <HugeiconsIcon
            icon={isCollapsed ? ArrowDown01Icon : ArrowUp01Icon}
            strokeWidth={2}
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {label}
        </Button>
      </h3>

      {!isCollapsed && (
        <div id={bodyId}>
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
                onSelectAll(filteredValues.map(({ value }) => value))
              }
            >
              {t('board.facets.select_all')}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              isDisabled={selectedValues.size === 0}
              onPress={onClearAll}
            >
              {t('board.facets.clear_all')}
            </Button>
          </div>

          <div
            className={`mt-2 grid gap-0.5 ${isRefetching ? 'opacity-50 transition-opacity duration-150' : ''}`}
          >
            {isContentLoading ? (
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
              visibleValues.map(
                ({ value, label: valueLabel, count, entityType }) => (
                  <FacetCheckbox
                    key={value}
                    label={valueLabel}
                    accessibleLabel={t('board.facets.select_value', {
                      value: valueLabel,
                    })}
                    entityType={entityType}
                    count={count}
                    isSelected={selectedValues.has(value)}
                    onChange={(selected) => onChange(value, selected)}
                  />
                ),
              )
            )}
          </div>

          {!isContentLoading && canToggleExpansion && (
            <Button
              size="xs"
              variant="ghost"
              className="mt-1 w-full"
              aria-expanded={isValuesExpanded}
              onPress={onToggleValuesExpanded}
            >
              {t(
                isValuesExpanded
                  ? 'board.facets.show_less'
                  : 'board.facets.show_more',
              )}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
