import type { mongo } from 'mongoose'

type Collection = mongo.Collection

export async function initializeAuthChallengeIndexes(
  authChallenges: Collection,
): Promise<void> {
  await authChallenges.createIndex(
    { expiresAt: 1 },
    { name: 'auth_challenges_expiration', expireAfterSeconds: 0 },
  )
}
