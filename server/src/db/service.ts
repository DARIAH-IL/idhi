import type { Connection } from 'mongoose'
import {
  createAuthChallengeDatabaseService,
  type AuthChallengeDatabaseService,
} from './services/authChallenges'
import {
  createDistributedLockDatabaseService,
  type DistributedLockDatabaseService,
} from './services/locks'
import {
  createEntityDatabaseService,
  type EntityDatabaseService,
} from './services/entities'
import {
  createUserDatabaseService,
  type UserDatabaseService,
} from './services/users'
import {
  createUserInviteDatabaseService,
  type UserInviteDatabaseService,
} from './services/userInvites'

export interface DatabaseService {
  authChallenges: AuthChallengeDatabaseService
  entities: EntityDatabaseService
  isLive(): Promise<boolean>
  locks: DistributedLockDatabaseService
  userInvites: UserInviteDatabaseService
  users: UserDatabaseService
}

let databaseServicePromise: Promise<DatabaseService> | undefined

export const createDatabaseService = async (
  connection: Connection,
): Promise<DatabaseService> => {
  if (!databaseServicePromise) {
    databaseServicePromise = Promise.all([
      createAuthChallengeDatabaseService(connection),
      createEntityDatabaseService(connection),
      createDistributedLockDatabaseService(connection),
      createUserDatabaseService(connection),
      createUserInviteDatabaseService(connection),
    ])
      .then(([authChallenges, entities, locks, users, userInvites]) => ({
        authChallenges,
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
      }))
      .catch((error) => {
        databaseServicePromise = undefined
        throw error
      })
  }

  return databaseServicePromise
}
