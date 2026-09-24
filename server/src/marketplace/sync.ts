import type { DatabaseService } from '../db/service'
import type { EntityViewer, EntityWrite } from '../db/services/entities'
import type {
  MarketplaceActorMapping,
  MarketplaceCategory,
  MarketplaceItemMapping,
} from '../db/services/marketplace'
import type { RequestLogger } from '../middleware/logger'
import type { AuditedEntity } from '../models'
import { MarketplaceApiError } from './fetcher'
import type { MarketplaceClient, MarketplaceItem } from './api/client'
import {
  actorExternalIds,
  actorName,
  buildActorPayload,
  buildItemPayload,
  isActorEntity,
  marketplaceCategory,
  marketplacePermalink,
} from './mapping'
import type { MappingContext } from './mapping'
import { bestActorMatch, bestItemMatch } from './matching'
import type { MarketplaceItemPayload } from './payloads'

const SYNCED_ENTITY_TYPES = [
  'idhi:Tool',
  'idhi:Service',
  'idhi:Dataset',
  'idhi:TrainingMaterial',
  'idhi:Publication',
]
const ENTITY_PAGE_SIZE = 100
const SOURCE_LABEL = 'Israeli Digital Humanities Index'
const APPROVED_STATUS = 'approved'
const MARKETPLACE_LANGUAGE = 'en'

export type MarketplaceSyncLogger = RequestLogger & {
  info: (message: string, attributes: Record<string, unknown>) => void
}

export interface MarketplaceSyncConfig {
  marketplaceUrl: string
  frontendUrl: string
  auditUserId: string
  dryRun: boolean
}

export interface MarketplaceSyncReport {
  created: string[]
  updated: string[]
  matched: string[]
  unchanged: number
  published: string[]
  deleted: string[]
  skipped: { entityId: string; reason: string }[]
  actors: {
    created: string[]
    matched: string[]
    updated: string[]
    deleted: string[]
  }
}

export class MarketplaceSyncError extends Error {
  constructor(
    readonly entityId: string,
    readonly step: string,
    cause: unknown,
  ) {
    super(
      `Marketplace sync failed to ${step} for ${entityId}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    )
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof MarketplaceApiError && error.status === 404
}

function ignoreNotFound(error: unknown): void {
  if (!isNotFound(error)) {
    throw error
  }
}

async function withEntity<T>(
  entityId: string,
  step: string,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action()
  } catch (error) {
    if (error instanceof MarketplaceSyncError) {
      throw error
    }
    throw new MarketplaceSyncError(entityId, step, error)
  }
}

async function hashPayload(payload: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function toEntityWrite(
  { audit: _audit, isDraft: _isDraft, ...entity }: AuditedEntity,
  sameAs: string[],
): EntityWrite {
  return { ...entity, same_as: sameAs }
}

export async function syncMarketplace(
  db: DatabaseService,
  client: MarketplaceClient,
  config: MarketplaceSyncConfig,
  logger: MarketplaceSyncLogger,
): Promise<MarketplaceSyncReport> {
  const report: MarketplaceSyncReport = {
    created: [],
    updated: [],
    matched: [],
    unchanged: 0,
    published: [],
    deleted: [],
    skipped: [],
    actors: { created: [], matched: [], updated: [], deleted: [] },
  }
  const now = () => new Date().toISOString()
  const viewer: EntityViewer = {
    id: config.auditUserId,
    isAdmin: true,
    draftAuthorIds: [],
  }

  function log(
    level: 'debug' | 'info' | 'warn',
    message: string,
    attributes: Record<string, unknown>,
  ): void {
    logger[level](message, { ...attributes, dryRun: config.dryRun })
  }

  async function write<T>(action: () => Promise<T>): Promise<T | undefined> {
    return config.dryRun ? undefined : action()
  }

  const sourceUrl = config.frontendUrl.replace(/\/+$/, '')
  const existingSource = await client.findSource(sourceUrl)
  const source =
    existingSource ??
    (await write(() =>
      client.createSource(
        SOURCE_LABEL,
        sourceUrl,
        `${sourceUrl}/entities/{source-item-id}`,
      ),
    ))
  const sourceId = source?.id
  if (existingSource) {
    log('debug', 'Using marketplace source', { sourceUrl, sourceId })
  } else {
    log('info', 'Created marketplace source', { sourceUrl, sourceId })
  }

  const entities = new Map<string, AuditedEntity>()
  for (let page = 0; ; page += 1) {
    const { results } = await db.entities.search(
      undefined,
      undefined,
      { field: 'type', op: 'in', value: SYNCED_ENTITY_TYPES },
      [{ property: 'id', direction: 'asc' }],
      page,
      ENTITY_PAGE_SIZE,
      undefined,
    )
    for (const entity of results) {
      entities.set(entity.id, entity)
    }
    if (results.length < ENTITY_PAGE_SIZE) {
      break
    }
  }

  const itemMappings = new Map(
    (await db.marketplace.items.list()).map((mapping) => [
      mapping.entityId,
      mapping,
    ]),
  )
  const actorMappings = new Map(
    (await db.marketplace.actors.list()).map((mapping) => [
      mapping.entityId,
      mapping,
    ]),
  )

  async function saveItemMapping(mapping: MarketplaceItemMapping) {
    itemMappings.set(mapping.entityId, mapping)
    await write(() => db.marketplace.items.upsert(mapping))
  }

  async function deleteItemMapping(entityId: string) {
    itemMappings.delete(entityId)
    await write(() => db.marketplace.items.delete(entityId))
  }

  async function saveActorMapping(mapping: MarketplaceActorMapping) {
    actorMappings.set(mapping.entityId, mapping)
    await write(() => db.marketplace.actors.upsert(mapping))
  }

  const referenceCache = new Map<string, Promise<AuditedEntity | null>>()
  function getEntity(entityId: string): Promise<AuditedEntity | null> {
    const known = entities.get(entityId)
    if (known) {
      return Promise.resolve(known)
    }
    let cached = referenceCache.get(entityId)
    if (!cached) {
      cached = db.entities.get(entityId, undefined)
      referenceCache.set(entityId, cached)
    }
    return cached
  }

  const referencedActors = new Set<string>()
  const actorResolutions = new Map<string, Promise<number | undefined>>()
  const actorsInProgress = new Set<string>()

  async function syncActor(entityId: string): Promise<number | undefined> {
    const entity = await getEntity(entityId)
    if (!entity || !isActorEntity(entity)) {
      log('warn', 'Skipping referenced actor that is missing or not public', {
        entityId,
      })
      return undefined
    }
    const name = actorName(entity, MARKETPLACE_LANGUAGE)
    if (!name) {
      log('warn', 'Skipping actor without a name', { entityId })
      return undefined
    }
    referencedActors.add(entityId)
    const mapping = actorMappings.get(entityId)

    if (mapping?.origin === 'matched') {
      log('debug', 'Actor is linked to an existing marketplace actor', {
        entityId,
        actorId: mapping.actorId,
      })
      return mapping.actorId
    }

    if (!mapping) {
      const externalIds = actorExternalIds(entity)
      const candidates = [
        ...(await client.searchActors(name)),
        ...(
          await Promise.all(
            externalIds.map(({ identifier }) =>
              client.searchActors(identifier),
            ),
          )
        ).flat(),
      ]
      const match = bestActorMatch({ name, externalIds }, candidates)
      if (match) {
        await saveActorMapping({
          entityId,
          actorId: match.id,
          origin: 'matched',
          entityModifiedAt: entity.audit?.modifiedAt,
          syncedAt: now(),
        })
        report.actors.matched.push(entityId)
        log('info', 'Linked actor to existing marketplace actor', {
          entityId,
          actorId: match.id,
          name: match.name,
        })
        return match.id
      }
    }

    const payload = await buildActorPayload(entity, context)
    if (!payload) {
      log('warn', 'Skipping actor without a name', { entityId })
      return undefined
    }
    const payloadHash = await hashPayload(payload)

    if (mapping) {
      if (mapping.payloadHash === payloadHash) {
        log('debug', 'Marketplace actor unchanged', {
          entityId,
          actorId: mapping.actorId,
        })
      } else {
        await write(() => client.updateActor(mapping.actorId, payload))
        await saveActorMapping({
          ...mapping,
          payloadHash,
          entityModifiedAt: entity.audit?.modifiedAt,
          syncedAt: now(),
        })
        report.actors.updated.push(entityId)
        log('info', 'Updated marketplace actor', {
          entityId,
          actorId: mapping.actorId,
        })
      }
      return mapping.actorId
    }

    const created = await write(() => client.createActor(payload))
    report.actors.created.push(entityId)
    log('info', 'Created marketplace actor', {
      entityId,
      actorId: created?.id,
      name: payload.name,
    })
    if (!created) {
      return undefined
    }
    await saveActorMapping({
      entityId,
      actorId: created.id,
      origin: 'created',
      payloadHash,
      entityModifiedAt: entity.audit?.modifiedAt,
      syncedAt: now(),
    })
    return created.id
  }

  async function resolveActor(entityId: string): Promise<number | undefined> {
    if (actorsInProgress.has(entityId)) {
      return actorMappings.get(entityId)?.actorId
    }
    let resolution = actorResolutions.get(entityId)
    if (!resolution) {
      actorsInProgress.add(entityId)
      resolution = syncActor(entityId).finally(() =>
        actorsInProgress.delete(entityId),
      )
      actorResolutions.set(entityId, resolution)
    }
    return resolution
  }

  const context: MappingContext = {
    language: MARKETPLACE_LANGUAGE,
    sourceId: sourceId ?? 0,
    resolveActor,
    resolveItem: (entityId) => itemMappings.get(entityId)?.persistentId,
    conceptExists: client.conceptExists,
    findConcept: client.findConcept,
  }
  const matchingContext: MappingContext = {
    ...context,
    resolveActor: async () => undefined,
  }

  function permalinkPattern(category: MarketplaceCategory): RegExp {
    const base = config.marketplaceUrl
      .replace(/\/+$/, '')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${base}/${category}/([^/?#]+)/?$`, 'i')
  }

  function isPermalink(
    uri: string,
    category: MarketplaceCategory,
    persistentId: string,
  ): boolean {
    return permalinkPattern(category).exec(uri.trim())?.[1] === persistentId
  }

  async function writeSameAs(entityId: string, sameAs: string[]) {
    const entity = entities.get(entityId)
    if (!entity) {
      return
    }
    const current = entity.same_as ?? []
    if (
      current.length === sameAs.length &&
      current.every((uri, index) => uri === sameAs[index])
    ) {
      return
    }
    const updated = await write(() =>
      db.entities.replace(
        entityId,
        toEntityWrite(entity, sameAs),
        config.auditUserId,
        false,
        viewer,
        { source: 'marketplace-sync' },
      ),
    )
    log('info', 'Updated entity same_as', {
      entityId,
      added: sameAs.filter((uri) => !current.includes(uri)),
      removed: current.filter((uri) => !sameAs.includes(uri)),
    })
    if (updated) {
      entities.set(entityId, updated)
    }
  }

  async function ensurePermalink(mapping: MarketplaceItemMapping) {
    const entity = entities.get(mapping.entityId)
    if (!entity) {
      return
    }
    const permalink = marketplacePermalink(
      config.marketplaceUrl,
      mapping.category,
      mapping.persistentId,
    )
    const others = (entity.same_as ?? []).filter(
      (uri) => !isPermalink(uri, mapping.category, mapping.persistentId),
    )
    await writeSameAs(mapping.entityId, [...new Set([...others, permalink])])
  }

  async function removePermalink(mapping: MarketplaceItemMapping) {
    const entity = entities.get(mapping.entityId)
    if (!entity) {
      return
    }
    await writeSameAs(
      mapping.entityId,
      (entity.same_as ?? []).filter(
        (uri) => !isPermalink(uri, mapping.category, mapping.persistentId),
      ),
    )
  }

  async function findExistingItem(
    entity: AuditedEntity,
    category: MarketplaceCategory,
    payload: MarketplaceItemPayload,
  ): Promise<{ item: MarketplaceItem; ownSource: boolean } | undefined> {
    if (sourceId !== undefined) {
      const own = (await client.getSourceItems(sourceId, entity.id)).find(
        (item) => item.category === category,
      )
      if (own) {
        return { item: own, ownSource: true }
      }
    }

    const pattern = permalinkPattern(category)
    for (const uri of entity.same_as ?? []) {
      const persistentId = pattern.exec(uri.trim())?.[1]
      const linked = persistentId
        ? ((await client.getItem(category, persistentId, true)) ??
          (await client.getItem(category, persistentId, false)))
        : null
      if (linked) {
        return { item: linked, ownSource: false }
      }
    }

    const match = bestItemMatch(
      payload,
      await client.searchItems(payload.label, category),
    )
    return match ? { item: match, ownSource: false } : undefined
  }

  function itemStatus(item: MarketplaceItem | undefined) {
    return item?.status === APPROVED_STATUS ? 'published' : 'draft'
  }

  async function processItem(entity: AuditedEntity): Promise<boolean> {
    const category = marketplaceCategory(entity)
    if (!category) {
      return false
    }
    const mapping = itemMappings.get(entity.id)

    if (mapping?.origin === 'matched') {
      report.unchanged += 1
      log('debug', 'Entity is linked to an existing marketplace item', {
        entityId: entity.id,
        category,
        persistentId: mapping.persistentId,
      })
      return false
    }

    if (!mapping) {
      const preview = await buildItemPayload(entity, matchingContext)
      if ('skipped' in preview) {
        report.skipped.push({ entityId: entity.id, reason: preview.skipped })
        log('warn', 'Skipping entity', {
          entityId: entity.id,
          reason: preview.skipped,
        })
        return false
      }
      const existing = await findExistingItem(entity, category, preview.payload)
      if (existing && !existing.ownSource) {
        await saveItemMapping({
          entityId: entity.id,
          category,
          persistentId: existing.item.persistentId,
          status: itemStatus(existing.item),
          origin: 'matched',
          entityModifiedAt: entity.audit?.modifiedAt,
          syncedAt: now(),
        })
        report.matched.push(entity.id)
        log('info', 'Linked entity to existing marketplace item', {
          entityId: entity.id,
          category,
          persistentId: existing.item.persistentId,
          label: existing.item.label,
          status: existing.item.status,
        })
        return true
      }
      if (existing) {
        await saveItemMapping({
          entityId: entity.id,
          category,
          persistentId: existing.item.persistentId,
          status: itemStatus(existing.item),
          origin: 'created',
          syncedAt: now(),
        })
        log('info', 'Recovered mapping from the IDHI marketplace source', {
          entityId: entity.id,
          category,
          persistentId: existing.item.persistentId,
        })
        await processItem(entity)
        return true
      }
    }

    const result = await buildItemPayload(entity, context)
    if ('skipped' in result) {
      report.skipped.push({ entityId: entity.id, reason: result.skipped })
      log('warn', 'Skipping entity', {
        entityId: entity.id,
        reason: result.skipped,
      })
      return false
    }
    const payloadHash = await hashPayload(result.payload)

    if (!mapping) {
      const created = await write(() =>
        client.createItem(category, result.payload),
      )
      report.created.push(entity.id)
      log('info', 'Created marketplace item', {
        entityId: entity.id,
        category,
        persistentId: created?.persistentId,
        status: created?.status,
      })
      if (!created) {
        return false
      }
      await saveItemMapping({
        entityId: entity.id,
        category,
        persistentId: created.persistentId,
        status: itemStatus(created),
        origin: 'created',
        payloadHash,
        entityModifiedAt: entity.audit?.modifiedAt,
        syncedAt: now(),
      })
      return true
    }

    if (mapping.payloadHash === payloadHash) {
      report.unchanged += 1
      log('debug', 'Marketplace item unchanged', {
        entityId: entity.id,
        category,
        persistentId: mapping.persistentId,
      })
      return false
    }

    try {
      await write(() =>
        client.updateItem(category, mapping.persistentId, result.payload),
      )
    } catch (error) {
      if (!isNotFound(error)) {
        throw error
      }
      log('warn', 'Marketplace item disappeared, recreating it', {
        entityId: entity.id,
        category,
        persistentId: mapping.persistentId,
      })
      await removePermalink(mapping)
      await deleteItemMapping(entity.id)
      return processItem(entity)
    }
    await saveItemMapping({
      ...mapping,
      payloadHash,
      entityModifiedAt: entity.audit?.modifiedAt,
      syncedAt: now(),
    })
    report.updated.push(entity.id)
    log('info', 'Updated marketplace item', {
      entityId: entity.id,
      category,
      persistentId: mapping.persistentId,
    })
    return false
  }

  async function processItems(): Promise<boolean> {
    let mappedNewItems = false
    for (const entity of entities.values()) {
      mappedNewItems =
        (await withEntity(entity.id, 'sync item', () => processItem(entity))) ||
        mappedNewItems
    }
    return mappedNewItems
  }

  if (await processItems()) {
    report.unchanged = 0
    report.skipped = []
    await processItems()
  }

  for (const mapping of [...itemMappings.values()]) {
    if (entities.has(mapping.entityId)) {
      continue
    }
    await withEntity(mapping.entityId, 'delete item', async () => {
      if (await db.entities.get(mapping.entityId, undefined)) {
        return
      }
      if (mapping.origin === 'created') {
        await write(() =>
          client
            .deleteItem(mapping.category, mapping.persistentId)
            .catch(ignoreNotFound),
        )
      }
      await deleteItemMapping(mapping.entityId)
      report.deleted.push(mapping.entityId)
      log(
        'info',
        mapping.origin === 'created'
          ? 'Deleted marketplace item of deleted entity'
          : 'Unlinked deleted entity from existing marketplace item',
        {
          entityId: mapping.entityId,
          category: mapping.category,
          persistentId: mapping.persistentId,
        },
      )
    })
  }

  for (const mapping of [...itemMappings.values()]) {
    if (!entities.has(mapping.entityId)) {
      continue
    }
    await withEntity(mapping.entityId, 'refresh item status', async () => {
      if (mapping.status === 'draft') {
        const item =
          (await client.getItem(
            mapping.category,
            mapping.persistentId,
            true,
          )) ??
          (await client.getItem(mapping.category, mapping.persistentId, false))
        if (!item) {
          log('warn', 'Marketplace item disappeared, dropping its mapping', {
            entityId: mapping.entityId,
            category: mapping.category,
            persistentId: mapping.persistentId,
          })
          await deleteItemMapping(mapping.entityId)
          return
        }
        if (itemStatus(item) !== 'published') {
          log('debug', 'Marketplace item awaits approval', {
            entityId: mapping.entityId,
            category: mapping.category,
            persistentId: mapping.persistentId,
            status: item.status,
          })
          return
        }
        await saveItemMapping({
          ...mapping,
          status: 'published',
          publishedAt: now(),
        })
        report.published.push(mapping.entityId)
        log('info', 'Marketplace item was published', {
          entityId: mapping.entityId,
          category: mapping.category,
          persistentId: mapping.persistentId,
        })
      }
      const current = itemMappings.get(mapping.entityId)
      if (current) {
        await ensurePermalink(current)
      }
    })
  }

  for (const mapping of [...actorMappings.values()]) {
    if (referencedActors.has(mapping.entityId)) {
      continue
    }
    await withEntity(mapping.entityId, 'delete actor', async () => {
      if (mapping.origin === 'created') {
        await write(() =>
          client.deleteActor(mapping.actorId).catch(ignoreNotFound),
        )
      }
      actorMappings.delete(mapping.entityId)
      await write(() => db.marketplace.actors.delete(mapping.entityId))
      report.actors.deleted.push(mapping.entityId)
      log(
        'info',
        mapping.origin === 'created'
          ? 'Deleted unreferenced marketplace actor'
          : 'Unlinked unreferenced existing marketplace actor',
        { entityId: mapping.entityId, actorId: mapping.actorId },
      )
    })
  }

  return report
}
