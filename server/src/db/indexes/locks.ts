import type { mongo } from 'mongoose'

type Collection = mongo.Collection

export async function initializeDistributedLockIndexes(
  locks: Collection,
): Promise<void> {
  await locks.createIndex(
    { expiresAt: 1 },
    { name: 'distributed_locks_expiration', expireAfterSeconds: 0 },
  )
}
