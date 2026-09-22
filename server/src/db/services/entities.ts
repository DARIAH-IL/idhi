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
import { collectEntityReferences } from '../../utils/entityReferences'
import { createId } from '../../utils/id'
import { COLLECTIONS } from '../collections'
import { ENTITY_SEARCH_INDEX_NAME } from '../indexes/entities'
import {
  storedEntityField,
  toMongoEntityFilter,
  toMongoEntitySort,
} from '../queries/entities'
import { CASE_INSENSITIVE_COLLATION } from '../queries/filter'
import {
  SEARCH_SCORE_FIELD,
  escapeRegExpQuery,
  escapeWildcardQuery,
} from '../queries/search'

type StoredEntity = Omit<AuditedEntity, 'id' | 'isDraft'> & {
  _id: string
  _references?: string[]
  isDraft?: true
}

export type EntityDeleteResult =
  { status: 'deleted' } | { status: 'notFound' } | { status: 'referenced' }

export type EntityWrite = Entity extends infer EntityVariant
  ? EntityVariant extends { id: string }
    ? Omit<EntityVariant, 'id'> & { id?: string | null }
    : never
  : never

export type EntityViewer = Pick<User, 'id' | 'isAdmin'> & {
  draftAuthorIds: string[]
}

function draftVisibilityCondition(
  viewer: EntityViewer | undefined,
): Record<string, unknown> | undefined {
  if (viewer?.isAdmin) {
    return undefined
  }

  const draftAuthorIds = viewer?.draftAuthorIds ?? []

  return {
    $or: [
      { isDraft: { $ne: true } },
      ...(draftAuthorIds.length > 0
        ? [{ 'audit.createdBy': { $in: draftAuthorIds } }]
        : []),
    ],
  }
}

const FACET_VALUES_LIMIT = 100

const ENTITY_AUDIT_OPERATIONS = ['create', 'update', 'delete'] as const
type EntityAuditOperation = (typeof ENTITY_AUDIT_OPERATIONS)[number]

const ENTITY_AUDIT_SOURCES = ['web', 'mcp'] as const
export type EntityAuditSource = (typeof ENTITY_AUDIT_SOURCES)[number]

export interface EntityAuditContext {
  source: EntityAuditSource
  client?: { name?: string; version?: string }
}

type StoredEntityAudit = {
  _id: string
  entityId: string
  operation: EntityAuditOperation
  at: string
  by: string
  source: EntityAuditSource
  client?: { name?: string; version?: string }
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
  searchTags: (query: string | undefined, limit: number) => Promise<string[]>
  get: (
    entityId: string,
    viewer: EntityViewer | undefined,
  ) => Promise<AuditedEntity | null>
  insert: (
    entity: EntityWrite,
    userId: string,
    isDraft: boolean,
    context: EntityAuditContext,
  ) => Promise<AuditedEntity>
  replace: (
    entityId: string,
    entity: EntityWrite,
    userId: string,
    isDraft: boolean,
    viewer: EntityViewer,
    context: EntityAuditContext,
  ) => Promise<AuditedEntity | null>
  delete: (
    entityId: string,
    viewer: EntityViewer,
    context: EntityAuditContext,
  ) => Promise<EntityDeleteResult>
}

const serializationOptions: ToObjectOptions<StoredEntity> = {
  aliases: true,
  virtuals: true,
  transform(_document, entity) {
    Reflect.deleteProperty(entity, '_id')
    Reflect.deleteProperty(entity, '_references')
    return entity
  },
}

const entitySchema = new Schema<StoredEntity>(
  {
    _id: { type: String, alias: 'id' },
    _references: { type: [String], select: false },
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
    source: {
      type: String,
      enum: ENTITY_AUDIT_SOURCES,
      required: true,
    },
    client: {
      type: new Schema(
        { name: { type: String }, version: { type: String } },
        { _id: false },
      ),
    },
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
        const words = normalizedQuery.split(/\s+/).filter(Boolean)
        pipeline.push({
          $search: {
            index: ENTITY_SEARCH_INDEX_NAME,
            compound: {
              should: [
                {
                  phrase: {
                    query: normalizedQuery,
                    path: { wildcard: '*' },
                    score: { boost: { value: 8 } },
                  },
                },
                ...words.flatMap((word) => [
                  {
                    text: {
                      query: word,
                      path: { wildcard: '*' },
                    },
                  },
                  {
                    wildcard: {
                      query: `*${escapeWildcardQuery(word.toLowerCase())}*`,
                      path: { wildcard: '*' },
                      allowAnalyzedField: true,
                    },
                  },
                ]),
              ],
              minimumShouldMatch: 1,
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

      const isRandomSort = sort?.some(
        (criterion) => criterion.direction === 'random',
      )
      const documentStages: PipelineStage.FacetPipelineStage[] = isRandomSort
        ? [{ $sample: { size: pageSize } }]
        : [
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
      const aggregateQuery = entities.aggregate(pipeline)
      if (structuredMatch) {
        await aggregateQuery.collation(CASE_INSENSITIVE_COLLATION)
      }
      const [aggregation] = await aggregateQuery.exec()
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

    async searchTags(query, limit) {
      const normalizedQuery = query?.trim()
      const pipeline: PipelineStage[] = [
        { $unwind: '$tags' },
        { $match: { tags: { $type: 'string' } } },
      ]
      if (normalizedQuery) {
        pipeline.push({
          $match: {
            tags: {
              $regex: escapeRegExpQuery(normalizedQuery),
              $options: 'i',
            },
          },
        })
      }
      pipeline.push(
        { $group: { _id: '$tags' } },
        { $sort: { _id: 1 } },
        { $limit: limit },
      )

      const results = await entities
        .aggregate<{ _id: string }>(pipeline)
        .collation(CASE_INSENSITIVE_COLLATION)
      return results.map(({ _id: value }) => value)
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

    async insert(entity, userId, isDraft, context) {
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
        _references: collectEntityReferences(values),
        ...(isDraft ? { isDraft: true } : {}),
        audit,
      })
      await createdEntity.save()
      await entityAudit.create({
        _id: createId('audit'),
        entityId: id,
        operation: 'create',
        at: now,
        by: userId,
        source: context.source,
        client: context.client,
        after: exposeEntity(createdEntity),
      })

      return exposeEntity(createdEntity)
    },

    async replace(entityId, entity, userId, isDraft, viewer, context) {
      const draftMatch = draftVisibilityCondition(viewer)
      const currentEntity = await entities
        .findOne(
          draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
        )
        .exec()

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
      const nextIsDraft = currentEntity.isDraft === true && isDraft
      const { id: _ignoredId, ...values } = entity
      const updatedEntity = await entities
        .findOneAndReplace(
          draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
          {
            _id: entityId,
            ...values,
            _references: collectEntityReferences(values),
            ...(nextIsDraft ? { isDraft: true } : {}),
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
        source: context.source,
        client: context.client,
        before: exposeEntity(currentEntity),
        after: exposedUpdatedEntity,
      })

      return exposedUpdatedEntity
    },

    async delete(entityId, viewer, context) {
      const draftMatch = draftVisibilityCondition(viewer)
      const targetExists = await entities
        .exists(
          draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
        )
        .exec()

      if (!targetExists) {
        return { status: 'notFound' }
      }

      const referrer = await entities
        .findOne({ _id: { $ne: entityId }, _references: entityId }, { _id: 1 })
        .lean()
        .exec()

      if (referrer) {
        return { status: 'referenced' }
      }

      const deletedEntity = await entities.findOneAndDelete(
        draftMatch ? { _id: entityId, ...draftMatch } : { _id: entityId },
      )

      if (!deletedEntity) {
        return { status: 'notFound' }
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
        source: context.source,
        client: context.client,
        before,
      })

      return { status: 'deleted' }
    },
  }
}
