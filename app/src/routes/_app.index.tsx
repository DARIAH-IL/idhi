import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PauseIcon, PlayIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { TooltipTrigger } from 'react-aria-components'
import { EntityReferenceCard } from '@/components/entity/EntityReferenceCard'
import { HeroMatrixBackground } from '@/components/HeroMatrixBackground'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { getSearchEntitiesTypedQueryOptions } from '@/api/typedEntitySearch'
import { skipEntityBoardSearchRestoreOnce } from '@/lib/entityBoardSearchStorage'
import { useUIStore } from '@/stores/ui'
import {
  ENTITY_TYPES,
  getEntityTypeLabel,
  normalizeEntityType,
} from '@/lib/entity'
import type { AuditedEntity } from '@/api/models'
import type { EntityType } from '@/lib/entity'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

const FEATURED_PAGE_SIZE = 4
const RECENT_PAGE_SIZE = 4

type EntityTypeOption = {
  id: EntityType
  label: string
}

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: Route.fullPath })
  const [query, setQuery] = useState('')
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([])
  const featuredQuery = useQuery(
    getSearchEntitiesTypedQueryOptions(
      {
        pageSize: FEATURED_PAGE_SIZE,
        filter: { field: 'isDraft', op: 'ne', value: true },
        sort: [{ property: 'id', direction: 'random' }],
      },
      {
        query: {
          staleTime: Infinity,
          gcTime: Infinity,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    ),
  )
  const recentQuery = useQuery(
    getSearchEntitiesTypedQueryOptions({
      pageSize: RECENT_PAGE_SIZE,
      filter: { field: 'isDraft', op: 'ne', value: true },
      sort: [{ property: 'audit.createdAt', direction: 'desc' }],
    }),
  )

  const typeOptions = useMemo<EntityTypeOption[]>(
    () =>
      ENTITY_TYPES.map((type) => ({
        id: type,
        label: getEntityTypeLabel(type),
      })).sort((a, b) => a.label.localeCompare(b.label)),
    [t],
  )
  const featuredEntities = featuredQuery.data?.results ?? []
  const recentEntities = recentQuery.data?.results ?? []

  const search = () => {
    const trimmedQuery = query.trim()
    void navigate({
      to: '/entities',
      search: {
        q: trimmedQuery || undefined,
        facetFilters:
          entityTypes.length > 0
            ? { type: { include: entityTypes } }
            : undefined,
      },
    })
  }

  return (
    <div className="relative isolate -m-6 min-h-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-white to-[#3aafd2]"
      />
      <section className="relative z-20 px-6 pt-8 pb-6 sm:pt-12 sm:pb-10 lg:pb-16">
        <HeroMatrixBackground />

        <div className="relative z-20 mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {t('home.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-800 sm:text-lg">
            {t('home.subtitle')}
          </p>

          <form
            role="search"
            aria-label={t('home.search_label')}
            className="mx-auto mt-8 flex max-w-4xl flex-col gap-2 rounded-xl bg-background/90 p-2 shadow-lg ring-1 ring-slate-950/10 backdrop-blur sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              search()
            }}
          >
            <Combobox
              aria-label={t('home.entity_types')}
              selectionMode="multiple"
              defaultItems={typeOptions}
              value={entityTypes}
              onChange={(keys) => {
                const selectedTypes = keys.reduce<EntityType[]>(
                  (types, key) => {
                    const type = normalizeEntityType(String(key))
                    if (type) {
                      types.push(type)
                    }
                    return types
                  },
                  [],
                )
                setEntityTypes(selectedTypes)
              }}
              menuTrigger="focus"
            >
              <ComboboxChips className="min-h-10 min-w-48 bg-background py-1 sm:w-72">
                <ComboboxChipList aria-label={t('home.entity_types')}>
                  {(item: EntityTypeOption) => (
                    <ComboboxChip textValue={item.label}>
                      <EntityTypeIcon type={item.id} size="sm" />
                      <span>{item.label}</span>
                    </ComboboxChip>
                  )}
                </ComboboxChipList>
                <ComboboxChipsInput
                  aria-label={t('home.entity_types')}
                  placeholder={
                    entityTypes.length === 0
                      ? t('home.all_entity_types')
                      : undefined
                  }
                />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList
                  items={typeOptions}
                  renderEmptyState={() => (
                    <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
                  )}
                >
                  {(item) => (
                    <ComboboxItem id={item.id} textValue={item.label}>
                      <EntityTypeIcon type={item.id} size="sm" />
                      <span className="font-medium">{item.label}</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('common.search_placeholder')}
              aria-label={t('common.search')}
              className="h-10 bg-background px-3 text-sm sm:flex-1"
            />
            <Button type="submit" size="lg" className="h-10 px-5 text-sm">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              {t('common.search')}
            </Button>
          </form>
        </div>
        <BackgroundMotionToggle />
      </section>

      <section className="relative z-20 mx-auto grid max-w-6xl gap-10 px-6 pt-0 pb-12 lg:grid-cols-2">
        <EntrySection
          headingId="featured-heading"
          title={t('home.featured')}
          skipSearchRestore
          entries={featuredEntities}
          isLoading={featuredQuery.isLoading}
          isError={featuredQuery.isError}
        />
        <EntrySection
          headingId="recent-heading"
          title={t('home.recent')}
          skipSearchRestore
          seeAllSortByModifiedAt
          entries={recentEntities}
          isLoading={recentQuery.isLoading}
          isError={recentQuery.isError}
        />
      </section>
    </div>
  )
}

function BackgroundMotionToggle() {
  const { t } = useTranslation()
  const paused = useUIStore((state) => state.backgroundMotionPaused)
  const setPaused = useUIStore((state) => state.setBackgroundMotionPaused)
  const label = paused
    ? t('common.resume_animation')
    : t('common.pause_animation')

  return (
    <div className="relative z-30 mt-6 flex justify-center sm:absolute sm:end-4 sm:bottom-4 sm:mt-0">
      <TooltipTrigger delay={0}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          onPress={() => setPaused(!paused)}
          className="size-9 rounded-full bg-background/50 text-slate-700 opacity-70 backdrop-blur transition-opacity hover:bg-background/80 hover:opacity-100 focus-visible:opacity-100 sm:size-7 sm:opacity-60"
        >
          <HugeiconsIcon icon={paused ? PlayIcon : PauseIcon} strokeWidth={2} />
        </Button>
        <Tooltip>{label}</Tooltip>
      </TooltipTrigger>
    </div>
  )
}

function EntrySection({
  headingId,
  title,
  skipSearchRestore = false,
  seeAllSortByModifiedAt = false,
  entries,
  isLoading,
  isError,
}: {
  headingId: string
  title: string
  skipSearchRestore?: boolean
  seeAllSortByModifiedAt?: boolean
  entries: AuditedEntity[]
  isLoading: boolean
  isError: boolean
}) {
  const { t } = useTranslation()

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b pb-3">
        <h2 id={headingId} className="text-xl font-semibold">
          {title}
        </h2>
        {seeAllSortByModifiedAt ? (
          <Link
            to="/entities"
            search={{
              sort: { property: 'audit.modifiedAt', direction: 'desc' },
            }}
            className="app-link text-sm"
            onClick={
              skipSearchRestore ? skipEntityBoardSearchRestoreOnce : undefined
            }
          >
            {t('home.see_all')}
          </Link>
        ) : (
          <Link
            to="/entities"
            className="app-link text-sm"
            onClick={
              skipSearchRestore ? skipEntityBoardSearchRestoreOnce : undefined
            }
          >
            {t('home.see_all')}
          </Link>
        )}
      </div>
      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t('common.loading')}
        </p>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          {t('common.error')}
        </p>
      ) : entries.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t('common.no_results')}
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entity) => (
            <EntityReferenceCard
              key={entity.id}
              entityId={entity.id}
              entity={entity}
              className="bg-card hover:bg-sky-100"
            />
          ))}
        </div>
      )}
    </section>
  )
}
