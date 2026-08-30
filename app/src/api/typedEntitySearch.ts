import type {
  DataTag,
  QueryClient,
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  getGetEntityByIdQueryKey,
  getSearchEntitiesQueryKey,
  getSearchEntitiesQueryOptions,
  searchEntities,
  useSearchEntities,
} from '#/api/hooks/entities/entities.ts'
import type {
  AuditedEntity,
  EntitySearch,
  FilterOperator,
  SortDirection,
} from '#/api/models'
import type { ErrorType } from '#/api/client.ts'
import { auditedEntityId } from '#/lib/entity.ts'
import type { FieldPaths } from '#/lib/fieldPaths.ts'

export type EntityField = FieldPaths<AuditedEntity>

export type EntityFilter =
  | { field: EntityField; op: FilterOperator; value: unknown }
  | { and: EntityFilter[] }
  | { or: EntityFilter[] }

export interface EntitySortCriterion {
  property: EntityField
  direction: SortDirection
}

export interface TypedEntitySearch extends Omit<
  EntitySearch,
  'facets' | 'filter' | 'sort'
> {
  facets?: EntityField[]
  filter?: EntityFilter
  sort?: EntitySortCriterion[]
}

export const searchEntitiesTyped = (
  search: TypedEntitySearch,
  signal?: AbortSignal,
) => searchEntities(search, signal)

export function populateEntityByIdCache(
  queryClient: QueryClient,
  entities: readonly AuditedEntity[],
): void {
  for (const entity of entities) {
    queryClient.setQueryData(
      getGetEntityByIdQueryKey(auditedEntityId(entity)),
      entity,
    )
  }
}

export const fetchEntitiesTyped = async (
  queryClient: QueryClient,
  search: TypedEntitySearch,
  signal?: AbortSignal,
) => {
  const result = await searchEntitiesTyped(search, signal)
  populateEntityByIdCache(queryClient, result.results)
  return result
}

export const getSearchEntitiesTypedQueryKey = (search?: TypedEntitySearch) =>
  getSearchEntitiesQueryKey(search)

export const getSearchEntitiesTypedQueryKeyPrefix = () =>
  getSearchEntitiesTypedQueryKey().slice(0, 2)

export const getSearchEntitiesTypedQueryOptions = <
  TData = Awaited<ReturnType<typeof searchEntities>>,
  TError = ErrorType<unknown>,
>(
  search: TypedEntitySearch,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof searchEntities>>, TError, TData>
    >
  },
) => {
  const queryFn: QueryFunction<Awaited<ReturnType<typeof searchEntities>>> = ({
    client,
    signal,
  }) => fetchEntitiesTyped(client, search, signal)

  return {
    ...getSearchEntitiesQueryOptions<TData, TError>(search, options),
    queryFn,
  }
}

export function useSearchEntitiesTyped<
  TData = Awaited<ReturnType<typeof searchEntities>>,
  TError = ErrorType<unknown>,
>(
  search: TypedEntitySearch,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof searchEntities>>, TError, TData>
    >
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
} {
  const queryFn: QueryFunction<Awaited<ReturnType<typeof searchEntities>>> = ({
    client,
    signal,
  }) => fetchEntitiesTyped(client, search, signal)

  return useSearchEntities<TData, TError>(
    search,
    { query: { ...options?.query, queryFn } },
    queryClient,
  )
}
