import { Schema } from 'mongoose'
import type {
  Connection,
  HydratedDocument,
  PipelineStage,
  ToObjectOptions,
} from 'mongoose'
import type {
  AuditedEntity,
  Entity,
  Filter as EntityFilter,
  FilterableField,
  SortCriterion,
  User,
} from '../../models'
import { createEntityId } from '../../utils/entityId'
import { createId } from '../../utils/id'
import { COLLECTIONS } from '../collections'
import {
  ENTITY_SEARCH_INDEX_NAME,
  initializeEntityIndexes,
} from '../indexes/entities'
import {
  storedEntityField,
  toMongoEntityFilter,
  toMongoEntitySort,
} from '../queries/entities'
import { SEARCH_SCORE_FIELD } from '../queries/search'

type StoredEntity = Omit<AuditedEntity, 'id'> & {
  _id: string
}

export type EntityWrite = Entity extends infer EntityVariant
  ? EntityVariant extends { id: string }
    ? Omit<EntityVariant, 'id'> & { id?: string | null }
    : never
  : never

export type EntityViewer = Pick<User, 'id' | 'isAdmin'>

function draftVisibilityCondition(
  viewer: EntityViewer | undefined,
): Record<string, unknown> | undefined {
  if (viewer?.isAdmin) {
    return undefined
  }

  return {
    $or: [
      { isDraft: { $ne: true } },
      ...(viewer ? [{ 'audit.createdBy': viewer.id }] : []),
    ],
  }
}

const FACET_VALUES_LIMIT = 100

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
  search: (
    query: string | undefined,
    facets: FilterableField[] | undefined,
    filter: EntityFilter | undefined,
    sort: SortCriterion[] | undefined,
    page: number,
    pageSize: number,
    viewer: EntityViewer | undefined,
  ) => Promise<EntitySearchResult>
  get: (
    entityId: string,
    viewer: EntityViewer | undefined,
  ) => Promise<AuditedEntity | null>
  insert: (
    entity: EntityWrite,
    userId: string,
    isDraft: boolean,
  ) => Promise<AuditedEntity>
  replace: (
    entityId: string,
    entity: EntityWrite,
    userId: string,
    isDraft: boolean,
  ) => Promise<AuditedEntity | null>
  delete: (entityId: string, viewer: EntityViewer) => Promise<boolean>
}

const serializationOptions: ToObjectOptions<StoredEntity> = {
  aliases: true,
  virtuals: true,
  transform(_document, entity) {
    Reflect.deleteProperty(entity, '_id')
    return entity
  },
}

const entitySchema = new Schema<StoredEntity>(
  {
    _id: { type: String, alias: 'id' },
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
    await entities.createCollection()
    await initializeEntityIndexes(entities.collection, entityAudit.collection)
  }

  return {
    async search(
      query,
      requestedFacets,
      structuredFilter,
      sort,
      page,
      pageSize,
      viewer,
    ) {
      const normalizedQuery = query?.trim()
      const facetFields = [...new Set(requestedFacets)]
      const pipeline: PipelineStage[] = []
      if (normalizedQuery) {
        pipeline.push({
          $search: {
            index: ENTITY_SEARCH_INDEX_NAME,
            text: {
              query: normalizedQuery,
              path: { wildcard: '*' },
            },
          },
        })
        pipeline.push({
          $set: {
            [SEARCH_SCORE_FIELD]: { $meta: 'searchScore' },
          },
        })
      }

      const structuredMatch = structuredFilter
        ? toMongoEntityFilter(structuredFilter)
        : undefined
      const draftMatch = draftVisibilityCondition(viewer)
      const combinedMatch =
        structuredMatch && draftMatch
          ? { $and: [structuredMatch, draftMatch] }
          : (structuredMatch ?? draftMatch)
      if (combinedMatch) {
        pipeline.push({ $match: combinedMatch })
      }

      const documentStages: PipelineStage.FacetPipelineStage[] = [
        { $sort: toMongoEntitySort(sort, Boolean(normalizedQuery)) },
        { $skip: page * pageSize },
        { $limit: pageSize },
      ]
      if (normalizedQuery) {
        documentStages.push({ $unset: SEARCH_SCORE_FIELD })
      }

      const facets: Record<string, PipelineStage.FacetPipelineStage[]> = {
        documents: documentStages,
        total: [{ $count: 'count' }],
      }
      for (const [index, field] of facetFields.entries()) {
        const fieldPath = storedEntityField(field)
        facets[`facet${index}`] = [
          { $unwind: `$${fieldPath}` },
          { $match: { [fieldPath]: { $type: 'string' } } },
          {
            $group: {
              _id: { entity: '$_id', value: `$${fieldPath}` },
            },
          },
          { $group: { _id: '$_id.value', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: FACET_VALUES_LIMIT },
        ]
      }

      pipeline.push({ $facet: facets })
      const [aggregation] = await entities.aggregate(pipeline).exec()
      const documents = aggregation?.documents ?? []
      const facetEntries = facetFields.map((field, index) => [
        field,
        (aggregation?.[`facet${index}`] ?? []).map(
          ({ _id: value, count }: { _id: string; count: number }) => ({
            value,
            count,
          }),
        ),
      ])

      return {
        results: documents.map((document: StoredEntity) =>
          exposeEntity(entities.hydrate(document)),
        ),
        facets: Object.fromEntries(facetEntries),
        total: aggregation?.total[0]?.count ?? 0,
      }
    },

    async get(entityId, viewer) {
      const draftMatch = draftVisibilityCondition(viewer)
      const entity = await entities
        .findOne(
          draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
        )
        .exec()
      return entity ? exposeEntity(entity) : null
    },

    async insert(entity, userId, isDraft) {
      const now = new Date().toISOString()
      const id = createEntityId(entity.type)
      const audit = {
        createdAt: now,
        createdBy: userId,
        modifiedAt: now,
        modifiedBy: userId,
      }
      const { id: _ignoredId, ...values } = entity
      const createdEntity = new entities()
      createdEntity.set({
        _id: id,
        ...values,
        isDraft,
        audit,
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

    async replace(entityId, entity, userId, isDraft) {
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
      const nextIsDraft = Boolean(currentEntity.isDraft) && isDraft
      const { id: _ignoredId, ...values } = entity
      const updatedEntity = await entities
        .findOneAndReplace(
          { _id: entityId },
          {
            _id: entityId,
            ...values,
            isDraft: nextIsDraft,
            audit,
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

    async delete(entityId, viewer) {
      const draftMatch = draftVisibilityCondition(viewer)
      const deletedEntity = await entities.findOneAndDelete(
        draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
      )

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
        by: viewer.id,
        before,
      })

      return true
    },
  }
}
