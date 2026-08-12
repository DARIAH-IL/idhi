import {
  type Connection,
  type HydratedDocument,
  type QueryFilter,
  Schema,
  type ToObjectOptions,
} from 'mongoose'
import type {
  AuditedEntity,
  Entity,
  Filter as EntityFilter,
  FilterOperator,
  FilterableField,
  SortCriterion,
} from '../../models'
import { createId } from '../../utils/id'
import { searchDump } from '../../utils/searchDump'
import { COLLECTIONS } from '../collections'

type StoredEntity = Omit<AuditedEntity, 'id'> & {
  _id: string
  _s: string
}

const ENTITY_AUDIT_OPERATIONS = ['create', 'update', 'delete'] as const
type EntityAuditOperation = (typeof ENTITY_AUDIT_OPERATIONS)[number]

type StoredEntityAudit = {
  _id: string
  entityId: string
  operation: EntityAuditOperation
  at: string
  by: string
  before?: AuditedEntity
  after?: AuditedEntity
}

export interface EntitySearchResult {
  results: AuditedEntity[]
  facets: Record<string, { value: string; count: number }[]>
  total: number
}

export interface EntityDatabaseService {
  search(
    query: string | undefined,
    facets: FilterableField[] | undefined,
    filter: EntityFilter | undefined,
    sort: SortCriterion[] | undefined,
    page: number,
    pageSize: number,
  ): Promise<EntitySearchResult>
  get(entityId: string): Promise<AuditedEntity | null>
  insert(entity: Entity, userId: string): Promise<AuditedEntity>
  replace(
    entityId: string,
    entity: Entity,
    userId: string,
  ): Promise<AuditedEntity | null>
  delete(entityId: string, userId: string): Promise<boolean>
}

const serializationOptions: ToObjectOptions<StoredEntity> = {
  aliases: true,
  virtuals: true,
  transform(_document, entity) {
    Reflect.deleteProperty(entity, '_id')
    Reflect.deleteProperty(entity, '_s')
    return entity
  },
}

const entitySchema = new Schema<StoredEntity>(
  {
    _id: { type: String, alias: 'id' },
    _s: { type: String, required: true },
  },
  {
    id: false,
    strict: false,
    strictQuery: false,
    versionKey: false,
    toJSON: serializationOptions,
    toObject: serializationOptions,
  },
)

const entityAuditSchema = new Schema<StoredEntityAudit>(
  {
    _id: { type: String, required: true },
    entityId: { type: String, required: true },
    operation: {
      type: String,
      enum: ENTITY_AUDIT_OPERATIONS,
      required: true,
    },
    at: { type: String, required: true },
    by: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { versionKey: false },
)

function exposeEntity(entity: HydratedDocument<StoredEntity>): AuditedEntity {
  return entity.toObject<AuditedEntity>()
}

const MONGO_OPERATORS: Record<FilterOperator, string> = {
  eq: '$eq',
  ne: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  nin: '$nin',
  exists: '$exists',
}

function storedField(field: FilterableField): string {
  return field === 'id' ? '_id' : field
}

function comparisonFilter(
  field: FilterableField,
  operator: FilterOperator,
  value: unknown,
): QueryFilter<StoredEntity> {
  const mongoValue =
    operator === 'in' || operator === 'nin'
      ? Array.isArray(value)
        ? value
        : [value]
      : operator === 'exists'
        ? Boolean(value)
        : value

  return {
    [storedField(field)]: { [MONGO_OPERATORS[operator]]: mongoValue },
  }
}

function toMongoFilter(filter: EntityFilter): QueryFilter<StoredEntity> {
  if ('and' in filter) {
    return { $and: filter.and.map(toMongoFilter) }
  }

  if ('or' in filter) {
    return { $or: filter.or.map(toMongoFilter) }
  }

  return comparisonFilter(filter.field, filter.op, filter.value)
}

function toMongoSort(
  sort: SortCriterion[] | undefined,
): Record<string, 1 | -1> {
  if (!sort?.length) {
    return { 'audit.modifiedAt': -1, _id: 1 }
  }

  const fields = new Map<string, 1 | -1>()
  for (const criterion of sort) {
    fields.set(
      storedField(criterion.property),
      criterion.direction === 'asc' ? 1 : -1,
    )
  }
  if (!fields.has('_id')) fields.set('_id', 1)

  return Object.fromEntries(fields)
}

export async function createEntityDatabaseService(
  connection: Connection,
  initializeIndexes: boolean,
): Promise<EntityDatabaseService> {
  const entities = connection.model<StoredEntity>(
    'Entity',
    entitySchema,
    COLLECTIONS.entities,
  )
  const entityGraveyard = connection.model<StoredEntity>(
    'EntityGraveyard',
    entitySchema.clone(),
    COLLECTIONS.entityGraveyard,
  )
  const entityAudit = connection.model<StoredEntityAudit>(
    'EntityAudit',
    entityAuditSchema,
    COLLECTIONS.audit,
  )

  if (initializeIndexes) {
    await Promise.all([
      entities.collection.createIndex(
        { _s: 'text' },
        { name: 'entities_search' },
      ),
      entityAudit.collection.createIndex(
        { entityId: 1, at: -1 },
        { name: 'audit_entity_history' },
      ),
    ])
  }

  return {
    async search(
      query,
      requestedFacets,
      structuredFilter,
      sort,
      page,
      pageSize,
    ) {
      const normalizedQuery = query?.trim()
      const filter: QueryFilter<StoredEntity> = {
        ...(normalizedQuery ? { $text: { $search: normalizedQuery } } : {}),
        ...(structuredFilter ? toMongoFilter(structuredFilter) : {}),
      }
      const facetFields = [...new Set(requestedFacets)]
      const [documents, total, facetEntries] = await Promise.all([
        entities
          .find(filter)
          .sort(toMongoSort(sort))
          .skip(page * pageSize)
          .limit(pageSize)
          .exec(),
        entities.countDocuments(filter).exec(),
        Promise.all(
          facetFields.map(async (field) => {
            const fieldPath = storedField(field)
            const values = await entities
              .aggregate<{ _id: string; count: number }>([
                { $match: filter },
                { $unwind: `$${fieldPath}` },
                { $match: { [fieldPath]: { $type: 'string' } } },
                {
                  $group: {
                    _id: { entity: '$_id', value: `$${fieldPath}` },
                  },
                },
                { $group: { _id: '$_id.value', count: { $sum: 1 } } },
                { $sort: { count: -1, _id: 1 } },
              ])
              .exec()

            return [
              field,
              values.map(({ _id: value, count }) => ({ value, count })),
            ] as const
          }),
        ),
      ])

      return {
        results: documents.map(exposeEntity),
        facets: Object.fromEntries(facetEntries),
        total,
      }
    },

    async get(entityId) {
      const entity = await entities.findById(entityId).exec()
      return entity ? exposeEntity(entity) : null
    },

    async insert(entity, userId) {
      const now = new Date().toISOString()
      const audit = {
        createdAt: now,
        createdBy: userId,
        modifiedAt: now,
        modifiedBy: userId,
      }
      const { id, ...values } = entity
      const storedEntity = { id, ...values, audit }
      const createdEntity = new entities()
      createdEntity.set({
        _id: id,
        ...values,
        audit,
        _s: searchDump(storedEntity),
      })
      await createdEntity.save()
      await entityAudit.create({
        _id: createId('audit'),
        entityId: id,
        operation: 'create',
        at: now,
        by: userId,
        after: exposeEntity(createdEntity),
      })

      return exposeEntity(createdEntity)
    },

    async replace(entityId, entity, userId) {
      const currentEntity = await entities.findById(entityId).exec()

      if (!currentEntity) {
        return null
      }

      const now = new Date().toISOString()
      const currentAudit = currentEntity.audit
      const audit = {
        createdAt: currentAudit?.createdAt ?? now,
        createdBy: currentAudit?.createdBy ?? userId,
        modifiedAt: now,
        modifiedBy: userId,
      }
      const { id: entityIdFromBody, ...values } = entity
      const storedEntity = { id: entityIdFromBody, ...values, audit }
      const updatedEntity = await entities
        .findOneAndReplace(
          { _id: entityId },
          {
            _id: entityId,
            ...values,
            audit,
            _s: searchDump(storedEntity),
          },
          { new: true },
        )
        .exec()

      if (!updatedEntity) {
        return null
      }

      const exposedUpdatedEntity = exposeEntity(updatedEntity)
      await entityAudit.create({
        _id: createId('audit'),
        entityId,
        operation: 'update',
        at: now,
        by: userId,
        before: exposeEntity(currentEntity),
        after: exposedUpdatedEntity,
      })

      return exposedUpdatedEntity
    },

    async delete(entityId, userId) {
      const deletedEntity = await entities.findOneAndDelete({ _id: entityId })

      if (!deletedEntity) {
        return false
      }

      const before = exposeEntity(deletedEntity)
      const rawEntity = deletedEntity.toObject<StoredEntity>({
        aliases: false,
        transform: false,
        virtuals: false,
      })
      const at = new Date().toISOString()

      await entityGraveyard.create(rawEntity)
      await entityAudit.create({
        _id: createId('audit'),
        entityId,
        operation: 'delete',
        at,
        by: userId,
        before,
      })

      return true
    },
  }
}
