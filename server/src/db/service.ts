import type { Connection } from 'mongoose'
import { createAuthRateLimitDatabaseService } from './services/authRateLimits'
import type { AuthRateLimitDatabaseService } from './services/authRateLimits'
import { createAuthChallengeDatabaseService } from './services/authChallenges'
import type { AuthChallengeDatabaseService } from './services/authChallenges'
import { createDistributedLockDatabaseService } from './services/locks'
import type { DistributedLockDatabaseService } from './services/locks'
import { createEntityDatabaseService } from './services/entities'
import type { EntityDatabaseService } from './services/entities'
import { createUserDatabaseService } from './services/users'
import type { UserDatabaseService } from './services/users'
import { createUserInviteDatabaseService } from './services/userInvites'
import type { UserInviteDatabaseService } from './services/userInvites'

export interface DatabaseService {
  authChallenges: AuthChallengeDatabaseService
  authRateLimits: AuthRateLimitDatabaseService
  entities: EntityDatabaseService
  isLive: () => Promise<boolean>
  locks: DistributedLockDatabaseService
  userInvites: UserInviteDatabaseService
  users: UserDatabaseService
}

export const createDatabaseService = async (
  connection: Connection,
): Promise<DatabaseService> => {
  const [authChallenges, authRateLimits, entities, locks, users, userInvites] =
    await Promise.all([
      createAuthChallengeDatabaseService(connection),
      createAuthRateLimitDatabaseService(connection),
      createEntityDatabaseService(connection),
      createDistributedLockDatabaseService(connection),
      createUserDatabaseService(connection),
      createUserInviteDatabaseService(connection),
    ])

  return {
    authChallenges,
    authRateLimits,
    entities,
    async isLive() {
      if (connection.readyState !== 1 || !connection.db) {
        return false
      }

      try {
        await connection.db.admin().ping()
        return true
      } catch {
        return false
      }
    },
    locks,
    userInvites,
    users,
  }
}
