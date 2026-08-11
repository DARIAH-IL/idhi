import { Schema, type Connection } from 'mongoose'
import { COLLECTIONS } from '../collections'

type StoredAuthRateLimit = {
  _id: string
  count: number
  expiresAt: Date
}

export type AuthRateLimitResult = {
  allowed: boolean
  retryAfterEpoch: number
}

export interface AuthRateLimitDatabaseService {
  consume(
    key: string,
    limit: number,
    windowMilliseconds: number,
  ): Promise<AuthRateLimitResult>
}

const authRateLimitSchema = new Schema<StoredAuthRateLimit>(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
)

export async function createAuthRateLimitDatabaseService(
  connection: Connection,
  initializeIndexes: boolean,
): Promise<AuthRateLimitDatabaseService> {
  const authRateLimits = connection.model<StoredAuthRateLimit>(
    'AuthRateLimit',
    authRateLimitSchema,
    COLLECTIONS.authRateLimits,
  )

  if (initializeIndexes) {
    await authRateLimits.collection.createIndex(
      { expiresAt: 1 },
      {
        name: 'auth_rate_limits_expiration',
        expireAfterSeconds: 0,
      },
    )
  }

  return {
    async consume(key, limit, windowMilliseconds) {
      const now = Date.now()
      const bucketStart =
        Math.floor(now / windowMilliseconds) * windowMilliseconds
      const retryAfterEpoch = bucketStart + windowMilliseconds
      const bucketId = `${key}:${bucketStart}`
      const counter = await authRateLimits
        .findByIdAndUpdate(
          bucketId,
          {
            $inc: { count: 1 },
            $setOnInsert: { expiresAt: new Date(retryAfterEpoch) },
          },
          { new: true, upsert: true },
        )
        .exec()

      if (!counter) {
        throw new Error('Authentication rate limit counter was not created')
      }

      return {
        allowed: counter.count <= limit,
        retryAfterEpoch,
      }
    },
  }
}
