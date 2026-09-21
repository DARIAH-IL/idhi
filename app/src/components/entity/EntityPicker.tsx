import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { getSearchEntitiesTypedQueryOptions } from '@/api/typedEntitySearch'
import type { EntityFilter, TypedEntitySearch } from '@/api/typedEntitySearch'
import type { AuditedEntity } from '@/api/models/auditedEntity'
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
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useOnTheFlyEntityCreation } from '@/hooks/useOnTheFlyEntityCreation'
import { EntityReferenceCard } from './EntityReferenceCard'
import { EntityImage } from './EntityImage'
import { DraftBadge } from './DraftBadge'
import { getEntityTypeColorClass } from './EntityTypeIcon'

const CREATE_ITEM_ID = '__create_entity__'

type PickerItem =
  | { kind: 'create'; id: typeof CREATE_ITEM_ID }
  | { kind: 'entity'; id: string; entity: AuditedEntity }

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
  const onTheFlyCreation = useOnTheFlyEntityCreation()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (query === '') {
      setDebouncedQuery('')
      return
    }

    const timeout = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timeout)
  }, [query])

  const filter = useMemo<EntityFilter>(() => {
    if (entityTypes.length === 0) {
      throw new Error('EntityPicker requires at least one entity type.')
    }

    const entityTypeFilter: EntityFilter =
      entityTypes.length === 1
        ? { field: 'type', op: 'eq', value: entityTypes[0] }
        : { field: 'type', op: 'in', value: entityTypes }

    return {
      and: [entityTypeFilter, { field: 'isDraft', op: 'ne', value: true }],
    }
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
  const canCreate = Boolean(onTheFlyCreation && isDesktop)
  const items = useMemo<PickerItem[]>(() => {
    const entityItems: PickerItem[] = results.map((entity) => ({
      kind: 'entity',
      id: auditedEntityId(entity),
      entity,
    }))
    return canCreate
      ? [{ kind: 'create', id: CREATE_ITEM_ID }, ...entityItems]
      : entityItems
  }, [canCreate, results])

  return (
    <div className="flex flex-col gap-2">
      {value && <EntityReferenceCard entityId={value} titleLinkOnly />}
      <Combobox
        aria-label={searchPlaceholder}
        aria-busy={isFetching}
        menuTrigger="focus"
        allowsEmptyCollection
        items={items}
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
          if (key === CREATE_ITEM_ID) {
            setOpen(false)
            setQuery('')
            onTheFlyCreation?.open({ entityTypes, onCreated: onChange })
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
          {canCreate && (
            <div
              role="status"
              className={
                results.length === 0
                  ? 'px-3 pt-2 text-xs/relaxed text-muted-foreground'
                  : 'sr-only'
              }
            >
              {results.length === 0
                ? isFetching
                  ? t('common.searching')
                  : t('entity.picker.no_results')
                : ''}
            </div>
          )}
          <ComboboxList
            items={items}
            renderEmptyState={() => (
              <ComboboxEmpty role="status">
                {isFetching
                  ? t('common.searching')
                  : t('entity.picker.no_results')}
              </ComboboxEmpty>
            )}
          >
            {(item) => {
              if (item.kind === 'create') {
                return (
                  <ComboboxItem
                    id={item.id}
                    textValue={t('entity.picker.create_new')}
                    className="border-b border-border py-2 font-medium text-primary"
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {t('entity.picker.create_new')}
                  </ComboboxItem>
                )
              }
              const { entity } = item
              const id = item.id
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
                      entityId={id}
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
