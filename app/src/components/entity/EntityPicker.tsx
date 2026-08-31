import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Popover } from 'react-aria-components'
import { getSearchEntitiesTypedQueryOptions } from '@/api/typedEntitySearch'
import type { EntityFilter, TypedEntitySearch } from '@/api/typedEntitySearch'
import type { EntityType } from '@/lib/entity'
import {
  auditedEntityId,
  getEntityDisplayName,
  getEntityTypeLabel,
} from '@/lib/entity'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EntityReferenceCard } from './EntityReferenceCard'
import { EntityImage } from './EntityImage'
import { DraftBadge } from './DraftBadge'

interface Props {
  value?: string
  onChange: (value: string) => void
  entityTypes: EntityType[]
  placeholder?: string
  invalid?: boolean
}

export function EntityPicker({
  value,
  onChange,
  entityTypes,
  placeholder,
  invalid,
}: Props) {
  const { t } = useTranslation()
  const searchPlaceholder = placeholder ?? t('common.search_placeholder')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filter = useMemo<EntityFilter>(() => {
    if (entityTypes.length === 1) {
      return { field: 'type', op: 'eq', value: entityTypes[0] }
    }
    return { field: 'type', op: 'in', value: entityTypes }
  }, [entityTypes])
  const search = useMemo<TypedEntitySearch>(
    () => ({ q: query || undefined, filter, page: 0, pageSize: 10 }),
    [filter, query],
  )
  const { data, isFetching } = useQuery({
    ...getSearchEntitiesTypedQueryOptions(search),
    enabled: open,
  })

  return (
    <div className="flex flex-col gap-2">
      {value && <EntityReferenceCard entityId={value} />}
      <Input
        ref={inputRef}
        type="search"
        value={query}
        placeholder={
          value ? t('entity.picker.choose_another') : searchPlaceholder
        }
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        aria-invalid={invalid}
        aria-label={searchPlaceholder}
      />
      <Popover
        triggerRef={inputRef}
        isOpen={open}
        onOpenChange={setOpen}
        isNonModal
        placement="bottom start"
        style={{ width: 'var(--trigger-width)' }}
        className="z-50 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
      >
        {isFetching && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('common.searching')}
          </p>
        )}
        {!isFetching && data?.results.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('entity.picker.no_results')}
          </p>
        )}
        {data?.results.map((entity) => {
          const id = auditedEntityId(entity)
          return (
            <button
              key={id}
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-start hover:bg-accent"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(id)
                setQuery('')
                setOpen(false)
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <EntityImage
                  image={entity.image}
                  type={entity.type}
                  alt={getEntityDisplayName(entity)}
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
              <Badge variant="secondary">
                {getEntityTypeLabel(entity.type)}
              </Badge>
            </button>
          )
        })}
      </Popover>
    </div>
  )
}
