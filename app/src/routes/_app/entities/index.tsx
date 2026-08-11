import { useCallback, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { getPostApiV1EntitiesQueryOptions } from '@/api/hooks/entities/entities'
import type { EntitySearch, Filter } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import {
  ENTITY_TYPES,
  getEntityDisplayName,
  getEntityTypeLabel,
  formatDate,
  auditedEntityId,
} from '@/lib/entity'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 20
const entityBoardSearchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(ENTITY_TYPES).optional(),
  page: z.number().int().nonnegative().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/entities/')({
  validateSearch: entityBoardSearchSchema,
  loaderDeps: ({ search: { q, type, page } }) => ({ q, type, page }),
  loader: async ({ context, deps }) => {
    const filter: Filter | undefined = deps.type
      ? { field: 'type', op: 'eq', value: deps.type }
      : undefined
    const search: EntitySearch = {
      q: deps.q,
      page: deps.page,
      pageSize: PAGE_SIZE,
      filter,
    }
    await context.queryClient.ensureQueryData(
      getPostApiV1EntitiesQueryOptions(search),
    )
  },
  component: EntityBoard,
})

function EntityBoard() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, type, page } = Route.useSearch()

  const [searchInput, setSearchInput] = useState(q ?? '')

  const filter: Filter | undefined = type
    ? { field: 'type', op: 'eq', value: type }
    : undefined

  const search: EntitySearch = { q, page, pageSize: PAGE_SIZE, filter }

  const { data, isLoading, isError } = useQuery(
    getPostApiV1EntitiesQueryOptions(search),
  )

  const updateSearch = useCallback(
    (
      updates: Partial<{
        q: string
        type: EntityType | undefined
        page: number
      }>,
    ) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate],
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch({ q: searchInput || undefined, page: 0 })
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const currentPage = page ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('board.title')}</h1>
        <Link to="/entities/new" className={buttonVariants()}>
          {t('board.new_entity')}
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          type="search"
          placeholder={t('board.search_placeholder')}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="default">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => updateSearch({ type: undefined, page: 0 })}
          className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
            !type
              ? 'bg-primary text-primary-foreground'
              : 'border-border hover:bg-muted'
          }`}
        >
          {t('board.all_types')}
        </button>
        {ENTITY_TYPES.map((et) => (
          <button
            key={et}
            onClick={() => updateSearch({ type: et, page: 0 })}
            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
              type === et
                ? 'bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <EntityTypeIcon
                type={et}
                size="sm"
                className="size-5 bg-transparent dark:bg-transparent"
              />
              {getEntityTypeLabel(et)}
            </span>
          </button>
        ))}
      </div>

      {isError && (
        <p className="text-sm text-destructive">{t('common.error')}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead isRowHeader>{t('board.columns.name')}</TableHead>
              <TableHead>{t('board.columns.type')}</TableHead>
              <TableHead>{t('board.columns.modified')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('board.no_results')}
              </p>
            )}
          >
            {(data?.results ?? []).map((entity) => {
              const id = auditedEntityId(entity)
              return (
                <TableRow
                  key={id}
                  id={id}
                  onAction={() =>
                    void navigate({
                      to: '/entities/$entityId',
                      params: { entityId: encodeURIComponent(id) },
                    })
                  }
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <EntityTypeIcon type={entity.type} />
                      <Link
                        to="/entities/$entityId"
                        params={{ entityId: encodeURIComponent(id) }}
                        className="hover:underline font-medium"
                      >
                        {getEntityDisplayName(entity)}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getEntityTypeLabel(entity.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(
                      (entity as unknown as Record<string, unknown>)['audit']
                        ? (
                            entity as unknown as Record<
                              string,
                              Record<string, string>
                            >
                          )['audit']?.['modifiedAt']
                        : undefined,
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {t('board.pagination.page', {
              page: currentPage + 1,
              total: totalPages,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              isDisabled={currentPage === 0}
              onPress={() => updateSearch({ page: currentPage - 1 })}
            >
              {t('board.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              isDisabled={currentPage >= totalPages - 1}
              onPress={() => updateSearch({ page: currentPage + 1 })}
            >
              {t('board.pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
