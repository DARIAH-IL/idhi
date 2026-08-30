import { z } from 'zod'
import type {
  EntityDatabaseService,
  EntitySearchResult,
  EntityViewer,
  EntityWrite,
} from '../db/services/entities'
import { ApiError } from '../errors/ApiError'
import type { AuditedEntity } from '../models'
import type {
  Filter as EntityFilter,
  FilterableField,
  SortCriterion,
} from '../models'
import { FilterOperator } from '../models/filterOperator'
import { ErrorCode } from '../models/errorCode'
import { entityIdMatchesType } from './entityId'
import { isDuplicateKeyError } from './mongo'
import {
  searchEntitiesBodyFilterOneFieldRegExp,
  searchEntitiesBodyPageDefault,
  searchEntitiesBodyPageSizeDefault,
} from '../handlers/entities/entities.zod'

export function entityNotFound(entityId: string): ApiError {
  return new ApiError(
    ErrorCode.EntityNotFound,
    `Entity ${entityId} was not found`,
  )
}

export const entityFilterSchema: z.ZodType<EntityFilter> = z.lazy(() =>
  z.union([
    z.object({
      field: z.string().regex(searchEntitiesBodyFilterOneFieldRegExp),
      op: z.enum(FilterOperator),
      value: z.json(),
    }),
    z.object({ and: z.array(entityFilterSchema).min(1) }),
    z.object({ or: z.array(entityFilterSchema).min(1) }),
  ]),
)

export interface EntitySearchInput {
  q?: string
  facets?: FilterableField[]
  filter?: unknown
  sort?: SortCriterion[]
  page?: number
  pageSize?: number
}

export async function searchEntities(
  entities: EntityDatabaseService,
  { q, facets, filter, sort, page, pageSize }: EntitySearchInput,
  viewer: EntityViewer | undefined,
): Promise<EntitySearchResult> {
  return entities.search(
    q,
    facets,
    filter === undefined ? undefined : entityFilterSchema.parse(filter),
    sort,
    page ?? searchEntitiesBodyPageDefault,
    pageSize ?? searchEntitiesBodyPageSizeDefault,
    viewer,
  )
}

export async function getEntityOrThrow(
  entities: EntityDatabaseService,
  entityId: string,
  viewer: EntityViewer | undefined,
): Promise<AuditedEntity> {
  const entity = await entities.get(entityId, viewer)

  if (!entity) {
    throw entityNotFound(entityId)
  }

  return entity
}

export async function createEntity(
  entities: EntityDatabaseService,
  entity: EntityWrite,
  userId: string,
  isDraft: boolean,
): Promise<AuditedEntity> {
  try {
    return await entities.insert(entity, userId, isDraft)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(
        ErrorCode.InvalidInput,
        'An entity with this ID already exists',
      )
    }
    throw error
  }
}

export async function updateEntity(
  entities: EntityDatabaseService,
  entityId: string,
  entity: EntityWrite,
  userId: string,
  isDraft: boolean,
): Promise<AuditedEntity> {
  const requestEntityId = entity.id

  if (
    requestEntityId !== undefined &&
    requestEntityId !== null &&
    requestEntityId !== '' &&
    requestEntityId !== entityId
  ) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      'The entity ID in the request body must match the URL',
    )
  }

  if (!entityIdMatchesType(entityId, entity.type)) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      'The entity type in the request body must match the URL ID',
    )
  }

  const updatedEntity = await entities.replace(
    entityId,
    entity,
    userId,
    isDraft,
  )

  if (!updatedEntity) {
    throw entityNotFound(entityId)
  }

  return updatedEntity
}

export async function deleteEntity(
  entities: EntityDatabaseService,
  entityId: string,
  viewer: EntityViewer,
): Promise<void> {
  if (!(await entities.delete(entityId, viewer))) {
    throw entityNotFound(entityId)
  }
}
