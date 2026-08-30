import { useQueries } from '@tanstack/react-query'
import { getSearchEntitiesTypedQueryOptions } from '#/api/typedEntitySearch.ts'
import type { AuditedEntity } from '#/api/models/auditedEntity.ts'
import { auditedEntityId } from '#/lib/entity.ts'

const ENTITY_REFERENCE_BATCH_SIZE = 100

function batchEntityIds(entityIds: readonly string[]): string[][] {
  const normalizedIds = [...new Set(entityIds)].sort()
  const batches: string[][] = []

  for (
    let offset = 0;
    offset < normalizedIds.length;
    offset += ENTITY_REFERENCE_BATCH_SIZE
  ) {
    batches.push(
      normalizedIds.slice(offset, offset + ENTITY_REFERENCE_BATCH_SIZE),
    )
  }

  return batches
}

export function useEntityReferenceBatch(entityIds: readonly string[]) {
  const batches = batchEntityIds(entityIds)
  const queries = useQueries({
    queries: batches.map((batch) =>
      getSearchEntitiesTypedQueryOptions(
        {
          facets: [],
          filter: { field: 'id', op: 'in', value: batch },
          pageSize: ENTITY_REFERENCE_BATCH_SIZE,
        },
        { query: { retry: false } },
      ),
    ),
  })
  const entitiesById = new Map<string, AuditedEntity>()

  for (const query of queries) {
    for (const entity of query.data?.results ?? []) {
      entitiesById.set(auditedEntityId(entity), entity)
    }
  }

  return {
    entitiesById,
    isLoading: queries.some((query) => query.isPending),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
  }
}
