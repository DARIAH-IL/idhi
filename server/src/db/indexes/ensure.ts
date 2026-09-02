import { mongo } from 'mongoose'
import { COLLECTIONS } from '../collections.ts'
import { initializeAuthChallengeIndexes } from './authChallenges.ts'
import { initializeAuthRateLimitIndexes } from './authRateLimits.ts'
import { initializeEntityIndexes } from './entities.ts'
import { initializeDistributedLockIndexes } from './locks.ts'
import { initializeUserIndexes } from './users.ts'
import { initializeUserInviteIndexes } from './userInvites.ts'

const NAMESPACE_EXISTS_ERROR_CODE = 48

async function ensureCollectionExists(
  db: mongo.Db,
  name: string,
): Promise<void> {
  try {
    await db.createCollection(name)
  } catch (error) {
    if (
      !(error instanceof mongo.MongoServerError) ||
      error.code !== NAMESPACE_EXISTS_ERROR_CODE
    ) {
      throw error
    }
  }
}

export async function ensureIndexes(db: mongo.Db): Promise<void> {
  await ensureCollectionExists(db, COLLECTIONS.entities)

  await Promise.all([
    initializeUserIndexes(db.collection(COLLECTIONS.users)),
    initializeUserInviteIndexes(db.collection(COLLECTIONS.userInvites)),
    initializeAuthChallengeIndexes(db.collection(COLLECTIONS.authChallenges)),
    initializeAuthRateLimitIndexes(db.collection(COLLECTIONS.authRateLimits)),
    initializeDistributedLockIndexes(
      db.collection(COLLECTIONS.distributedLocks),
    ),
    initializeEntityIndexes(
      db.collection(COLLECTIONS.entities),
      db.collection(COLLECTIONS.audit),
    ),
  ])
}
