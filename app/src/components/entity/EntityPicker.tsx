import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPostApiV1EntitiesQueryOptions } from '@/api/hooks/entities/entities'
import type { EntitySearch, Filter } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import {
  auditedEntityId,
  getEntityDisplayName,
  getEntityTypeLabel,
} from '@/lib/entity'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EntityReferenceCard } from './EntityReferenceCard'
import { EntityTypeIcon } from './EntityTypeIcon'

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
  placeholder = 'Search entities…',
  invalid,
}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filter = useMemo<Filter>(() => {
    if (entityTypes.length === 1) {
      return { field: 'type', op: 'eq', value: entityTypes[0] }
    }
    return { field: 'type', op: 'in', value: entityTypes }
  }, [entityTypes])
  const search = useMemo<EntitySearch>(
    () => ({ q: query || undefined, filter, page: 0, pageSize: 10 }),
    [filter, query],
  )
  const { data, isFetching } = useQuery({
    ...getPostApiV1EntitiesQueryOptions(search),
    enabled: open,
  })

  return (
    <div className="flex flex-col gap-2">
      {value && <EntityReferenceCard entityId={value} />}
      <div className="relative">
        <Input
          type="search"
          value={query}
          placeholder={value ? 'Choose another entity…' : placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          aria-invalid={invalid}
          aria-label={placeholder}
        />
        {open && (
          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
            {isFetching && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                Searching…
              </p>
            )}
            {!isFetching && data?.results.length === 0 && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                No matching entities.
              </p>
            )}
            {data?.results.map((entity) => {
              const id = auditedEntityId(entity)
              return (
                <button
                  key={id}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left hover:bg-accent"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(id)
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <EntityTypeIcon type={entity.type} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {getEntityDisplayName(entity)}
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
          </div>
        )}
      </div>
    </div>
  )
}
