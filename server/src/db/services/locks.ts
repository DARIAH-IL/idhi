import { mongo, Schema, type Connection } from 'mongoose'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

type StoredLock = {
  _id: string
  token: string
  expiresAt: Date
}

export interface DistributedLock {
  lockId: string
  expiresAt: Date
  release(): Promise<boolean>
}

export interface DistributedLockDatabaseService {
  tryLock(
    lockId: string,
    ttlMilliseconds: number,
  ): Promise<DistributedLock | null>
}

const lockSchema = new Schema<StoredLock>(
  {
    _id: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
)

function validateLock(lockId: string, ttlMilliseconds: number): void {
  if (!lockId) {
    throw new Error('Lock ID is required')
  }

  if (!Number.isFinite(ttlMilliseconds) || ttlMilliseconds <= 0) {
    throw new Error('Lock TTL must be a positive number of milliseconds')
  }
}

export async function createDistributedLockDatabaseService(
  connection: Connection,
): Promise<DistributedLockDatabaseService> {
  const locks = connection.model<StoredLock>(
    'DistributedLock',
    lockSchema,
    'distributedLocks',
  )

  await locks.collection.createIndex(
    { expiresAt: 1 },
    {
      name: 'distributed_locks_expiration',
      expireAfterSeconds: 0,
    },
  )

  return {
    async tryLock(lockId, ttlMilliseconds) {
      validateLock(lockId, ttlMilliseconds)

      const now = new Date()
      const token = crypto.randomUUID()
      const expiresAt = new Date(now.getTime() + ttlMilliseconds)

      try {
        const lock = await locks
          .findOneAndUpdate(
            { _id: lockId, expiresAt: { $lte: now } },
            { $set: { token, expiresAt } },
            { new: true, upsert: true },
          )
          .exec()

        if (!lock) {
          return null
        }

        return {
          lockId,
          expiresAt,
          async release() {
            const result = await locks.deleteOne({ _id: lockId, token }).exec()

            return result.deletedCount === 1
          },
        }
      } catch (error) {
        if (
          error instanceof mongo.MongoServerError &&
          error.code === MONGO_DUPLICATE_KEY_ERROR_CODE
        ) {
          return null
        }

        throw error
      }
    },
  }
}
