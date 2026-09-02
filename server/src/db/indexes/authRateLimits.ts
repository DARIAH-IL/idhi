import type { mongo } from 'mongoose'

type Collection = mongo.Collection

export async function initializeAuthRateLimitIndexes(
  authRateLimits: Collection,
): Promise<void> {
  await authRateLimits.createIndex(
    { expiresAt: 1 },
    { name: 'auth_rate_limits_expiration', expireAfterSeconds: 0 },
  )
}
