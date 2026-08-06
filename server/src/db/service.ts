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

export interface DatabaseService {
  authChallenges: AuthChallengeDatabaseService
  locks: DistributedLockDatabaseService
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
    ])
      .then(([locks, users]) => ({
        authChallenges: createAuthChallengeDatabaseService(connection),
        locks,
        users,
      }))
      .catch((error) => {
        databaseServicePromise = undefined
        throw error
      })
  }

  return databaseServicePromise
}
