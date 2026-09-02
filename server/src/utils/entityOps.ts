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

const SEARCH_QUERY_MAX_LENGTH = 256
const SEARCH_FACETS_MAX_COUNT = 10
const SEARCH_FILTER_MAX_DEPTH = 10

function filterDepth(filter: EntityFilter): number {
  if ('and' in filter) {
    return 1 + Math.max(0, ...filter.and.map(filterDepth))
  }
  if ('or' in filter) {
    return 1 + Math.max(0, ...filter.or.map(filterDepth))
  }
  return 1
}

export async function searchEntities(
  entities: EntityDatabaseService,
  { q, facets, filter, sort, page, pageSize }: EntitySearchInput,
  viewer: EntityViewer | undefined,
): Promise<EntitySearchResult> {
  if (q !== undefined && q.length > SEARCH_QUERY_MAX_LENGTH) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      `q must not exceed ${SEARCH_QUERY_MAX_LENGTH} characters`,
    )
  }

  if (facets !== undefined && facets.length > SEARCH_FACETS_MAX_COUNT) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      `facets must not contain more than ${SEARCH_FACETS_MAX_COUNT} entries`,
    )
  }

  let parsedFilter: EntityFilter | undefined
  if (filter !== undefined) {
    try {
      parsedFilter = entityFilterSchema.parse(filter)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(ErrorCode.InvalidInput, 'Invalid filter')
      }
      throw error
    }

    if (filterDepth(parsedFilter) > SEARCH_FILTER_MAX_DEPTH) {
      throw new ApiError(
        ErrorCode.InvalidInput,
        `filter must not be nested more than ${SEARCH_FILTER_MAX_DEPTH} levels deep`,
      )
    }
  }

  return entities.search(
    q,
    facets,
    parsedFilter,
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
  viewer: EntityViewer,
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
    viewer,
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
