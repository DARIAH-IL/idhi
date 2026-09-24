import type { mongo } from 'mongoose'

type Collection = mongo.Collection

export async function initializeMarketplaceIndexes(
  items: Collection,
  actors: Collection,
): Promise<void> {
  await Promise.all([
    items.createIndex(
      { category: 1, persistentId: 1 },
      { name: 'marketplace_items_persistent_id', unique: true },
    ),
    items.createIndex({ status: 1 }, { name: 'marketplace_items_status' }),
    actors.createIndex({ actorId: 1 }, { name: 'marketplace_actors_actor_id' }),
  ])
}
