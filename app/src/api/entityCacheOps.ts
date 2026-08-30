import type { QueryClient } from '@tanstack/react-query'
import { getGetEntityByIdQueryKey } from '#/api/hooks/entities/entities.ts'
import type { AuditedEntity } from '#/api/models/auditedEntity.ts'
import {
  getSearchEntitiesTypedQueryKeyPrefix,
  populateEntityByIdCache,
} from '#/api/typedEntitySearch.ts'

export function refreshEntitySearchCaches(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: getSearchEntitiesTypedQueryKeyPrefix(),
  })
}

export function cacheSavedEntity(
  queryClient: QueryClient,
  entity: AuditedEntity,
): Promise<void> {
  populateEntityByIdCache(queryClient, [entity])
  return refreshEntitySearchCaches(queryClient)
}

export function removeDeletedEntityFromCache(
  queryClient: QueryClient,
  entityId: string,
): Promise<void> {
  queryClient.removeQueries({
    queryKey: getGetEntityByIdQueryKey(entityId),
    exact: true,
  })
  return refreshEntitySearchCaches(queryClient)
}
