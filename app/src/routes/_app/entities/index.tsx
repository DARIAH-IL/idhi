import { useCallback, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getPostApiV1EntitiesQueryOptions } from '@/api/hooks/entities/entities'
import type { EntitySearch, Filter } from '@/api/models'
import {
  ENTITY_TYPES,
  getEntityDisplayName,
  getEntityTypeLabel,
  formatDate,
  auditedEntityId,
} from '@/lib/entity'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 20

export const Route = createFileRoute('/_app/entities/')({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s['q'] === 'string' ? s['q'] : undefined,
    type: typeof s['type'] === 'string' ? s['type'] : undefined,
    page: typeof s['page'] === 'number' ? s['page'] : 0,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    const filter: Filter | undefined = deps.type
      ? { field: 'type', op: 'eq', value: deps.type }
      : undefined
    const search: EntitySearch = {
      q: deps.q,
      page: deps.page,
      pageSize: PAGE_SIZE,
      filter,
    }
    return context.queryClient.ensureQueryData(
      getPostApiV1EntitiesQueryOptions(search),
    )
  },
  component: EntityBoard,
})

function EntityBoard() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: '/entities' })
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
      updates: Partial<{ q: string; type: string | undefined; page: number }>,
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
        <Button asChild size="default">
          <Link to="/entities/new">{t('board.new_entity')}</Link>
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          type="search"
          placeholder={t('board.search_placeholder')}
          value={searchInput}
          onChange={setSearchInput}
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
            {getEntityTypeLabel(et)}
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
                    <Link
                      to="/entities/$entityId"
                      params={{ entityId: encodeURIComponent(id) }}
                      className="hover:underline font-medium"
                    >
                      {getEntityDisplayName(entity)}
                    </Link>
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
