import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getSearchEntitiesTypedQueryOptions } from '@/api/typedEntitySearch'
import type { EntityFilter, TypedEntitySearch } from '@/api/typedEntitySearch'
import type { EntityType } from '@/lib/entity'
import {
  auditedEntityId,
  getEntityDisplayName,
  getEntityTypeLabel,
} from '@/lib/entity'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { EntityReferenceCard } from './EntityReferenceCard'
import { EntityImage } from './EntityImage'
import { DraftBadge } from './DraftBadge'
import { getEntityTypeColorClass } from './EntityTypeIcon'
import type { AuditedEntity } from '#/api/models/auditedEntity.ts'

interface Props {
  value?: string
  onChange: (value: string) => void
  entityTypes: EntityType[]
  placeholder?: string
  invalid?: boolean
  required?: boolean
}

export function EntityPicker({
  value,
  onChange,
  entityTypes,
  placeholder,
  invalid,
  required,
}: Props) {
  const { t } = useTranslation()
  const searchPlaceholder = placeholder ?? t('common.search_placeholder')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timeout)
  }, [query])

  const filter = useMemo<EntityFilter>(() => {
    if (entityTypes.length === 1) {
      return { field: 'type', op: 'eq', value: entityTypes[0] }
    }
    return { field: 'type', op: 'in', value: entityTypes }
  }, [entityTypes])
  const search = useMemo<TypedEntitySearch>(
    () => ({ q: debouncedQuery || undefined, filter, page: 0, pageSize: 10 }),
    [filter, debouncedQuery],
  )
  const { data, isFetching } = useQuery({
    ...getSearchEntitiesTypedQueryOptions(search),
    enabled: open,
  })

  const results: AuditedEntity[] = data?.results ?? []

  return (
    <div className="flex flex-col gap-2">
      {value && <EntityReferenceCard entityId={value} />}
      <Combobox
        aria-label={searchPlaceholder}
        aria-busy={isFetching}
        menuTrigger="focus"
        allowsEmptyCollection
        items={results}
        inputValue={query}
        onInputChange={setQuery}
        onOpenChange={setOpen}
        selectedKey={null}
        isRequired={required}
        isInvalid={invalid}
        onChange={(key) => {
          if (key == null) {
            return
          }
          onChange(String(key))
          setQuery('')
        }}
      >
        <ComboboxInput
          placeholder={
            value ? t('entity.picker.choose_another') : searchPlaceholder
          }
          showTrigger={false}
        />
        <ComboboxContent>
          <ComboboxList
            items={results}
            renderEmptyState={() => (
              <ComboboxEmpty role="status">
                {isFetching
                  ? t('common.searching')
                  : t('entity.picker.no_results')}
              </ComboboxEmpty>
            )}
          >
            {(entity) => {
              const id = auditedEntityId(entity)
              return (
                <ComboboxItem
                  id={id}
                  textValue={getEntityDisplayName(entity)}
                  className="justify-between py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <EntityImage
                      image={entity.image}
                      type={entity.type}
                      alt=""
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-sm font-medium">
                          {getEntityDisplayName(entity)}
                        </span>
                        <DraftBadge isDraft={entity.isDraft} />
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">
                        {id}
                      </span>
                    </span>
                  </span>
                  <Badge
                    variant="secondary"
                    className={getEntityTypeColorClass(entity.type)}
                  >
                    {getEntityTypeLabel(entity.type)}
                  </Badge>
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
