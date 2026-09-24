import { Schema } from 'mongoose'
import type { Connection } from 'mongoose'
import { COLLECTIONS } from '../collections'

export const MARKETPLACE_CATEGORIES = [
  'tool-or-service',
  'training-material',
  'publication',
  'dataset',
] as const
export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number]

export const MARKETPLACE_STATUSES = ['draft', 'published'] as const
export type MarketplaceStatus = (typeof MARKETPLACE_STATUSES)[number]

export const MARKETPLACE_ORIGINS = ['created', 'matched'] as const
export type MarketplaceOrigin = (typeof MARKETPLACE_ORIGINS)[number]

export interface MarketplaceItemMapping {
  entityId: string
  category: MarketplaceCategory
  persistentId: string
  status: MarketplaceStatus
  origin: MarketplaceOrigin
  payloadHash?: string
  entityModifiedAt?: string
  syncedAt: string
  publishedAt?: string
}

export interface MarketplaceActorMapping {
  entityId: string
  actorId: number
  origin: MarketplaceOrigin
  payloadHash?: string
  entityModifiedAt?: string
  syncedAt: string
}

type StoredMarketplaceItem = Omit<MarketplaceItemMapping, 'entityId'> & {
  _id: string
}

type StoredMarketplaceActor = Omit<MarketplaceActorMapping, 'entityId'> & {
  _id: string
}

export interface MarketplaceDatabaseService {
  items: {
    list: () => Promise<MarketplaceItemMapping[]>
    get: (entityId: string) => Promise<MarketplaceItemMapping | null>
    upsert: (mapping: MarketplaceItemMapping) => Promise<void>
    delete: (entityId: string) => Promise<void>
  }
  actors: {
    list: () => Promise<MarketplaceActorMapping[]>
    get: (entityId: string) => Promise<MarketplaceActorMapping | null>
    upsert: (mapping: MarketplaceActorMapping) => Promise<void>
    delete: (entityId: string) => Promise<void>
  }
}

const marketplaceItemSchema = new Schema<StoredMarketplaceItem>(
  {
    _id: { type: String, required: true },
    category: { type: String, enum: MARKETPLACE_CATEGORIES, required: true },
    persistentId: { type: String, required: true },
    status: { type: String, enum: MARKETPLACE_STATUSES, required: true },
    origin: { type: String, enum: MARKETPLACE_ORIGINS, required: true },
    payloadHash: { type: String },
    entityModifiedAt: { type: String },
    syncedAt: { type: String, required: true },
    publishedAt: { type: String },
  },
  { versionKey: false },
)

const marketplaceActorSchema = new Schema<StoredMarketplaceActor>(
  {
    _id: { type: String, required: true },
    actorId: { type: Number, required: true },
    origin: { type: String, enum: MARKETPLACE_ORIGINS, required: true },
    payloadHash: { type: String },
    entityModifiedAt: { type: String },
    syncedAt: { type: String, required: true },
  },
  { versionKey: false },
)

function exposeItem({
  _id,
  ...mapping
}: StoredMarketplaceItem): MarketplaceItemMapping {
  return { entityId: _id, ...mapping }
}

function exposeActor({
  _id,
  ...mapping
}: StoredMarketplaceActor): MarketplaceActorMapping {
  return { entityId: _id, ...mapping }
}

export async function createMarketplaceDatabaseService(
  connection: Connection,
): Promise<MarketplaceDatabaseService> {
  const items = connection.model<StoredMarketplaceItem>(
    'MarketplaceItem',
    marketplaceItemSchema,
    COLLECTIONS.marketplaceItems,
  )
  const actors = connection.model<StoredMarketplaceActor>(
    'MarketplaceActor',
    marketplaceActorSchema,
    COLLECTIONS.marketplaceActors,
  )

  return {
    items: {
      async list() {
        const mappings = await items
          .find()
          .sort({ _id: 1 })
          .lean<StoredMarketplaceItem[]>()
          .exec()
        return mappings.map(exposeItem)
      },

      async get(entityId) {
        const mapping = await items
          .findById(entityId)
          .lean<StoredMarketplaceItem>()
          .exec()
        return mapping ? exposeItem(mapping) : null
      },

      async upsert({ entityId, ...mapping }) {
        await items
          .replaceOne({ _id: entityId }, mapping, { upsert: true })
          .exec()
      },

      async delete(entityId) {
        await items.deleteOne({ _id: entityId }).exec()
      },
    },

    actors: {
      async list() {
        const mappings = await actors
          .find()
          .sort({ _id: 1 })
          .lean<StoredMarketplaceActor[]>()
          .exec()
        return mappings.map(exposeActor)
      },

      async get(entityId) {
        const mapping = await actors
          .findById(entityId)
          .lean<StoredMarketplaceActor>()
          .exec()
        return mapping ? exposeActor(mapping) : null
      },

      async upsert({ entityId, ...mapping }) {
        await actors
          .replaceOne({ _id: entityId }, mapping, { upsert: true })
          .exec()
      },

      async delete(entityId) {
        await actors.deleteOne({ _id: entityId }).exec()
      },
    },
  }
}
