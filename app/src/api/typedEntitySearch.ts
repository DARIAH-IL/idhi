import type {
  DataTag,
  QueryClient,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import {
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

type Primitive = string | number | boolean | null | undefined

type FieldPaths<T> = T extends Primitive
  ? never
  : T extends readonly (infer Item)[]
    ? FieldPaths<Item>
    : {
        [K in keyof T & string]: K | `${K}.${FieldPaths<NonNullable<T[K]>>}`
      }[keyof T & string]

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

export const getSearchEntitiesTypedQueryKey = (search?: TypedEntitySearch) =>
  getSearchEntitiesQueryKey(search)

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
) => getSearchEntitiesQueryOptions<TData, TError>(search, options)

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
  return useSearchEntities<TData, TError>(search, options, queryClient)
}
