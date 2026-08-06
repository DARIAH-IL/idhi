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
  createUserDatabaseService,
  type UserDatabaseService,
} from './services/users'
import {
  createUserInviteDatabaseService,
  type UserInviteDatabaseService,
} from './services/userInvites'

export interface DatabaseService {
  authChallenges: AuthChallengeDatabaseService
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
      createDistributedLockDatabaseService(connection),
      createUserDatabaseService(connection),
      createUserInviteDatabaseService(connection),
    ])
      .then(([locks, users, userInvites]) => ({
        authChallenges: createAuthChallengeDatabaseService(connection),
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
