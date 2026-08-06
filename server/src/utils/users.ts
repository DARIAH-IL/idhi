import type { DatabaseService } from '../db/service'
import type { UserWithCredentials } from '../db/models/UserWithCredentials'
import { ApiError } from '../errors/ApiError'
import { serializeError, type RequestLogger } from '../middleware/logger'
import { ErrorCode } from '../models/errorCode'
import { createId } from './id'

export async function resolveUserForEmail(
  email: string,
  db: DatabaseService,
  logger: RequestLogger,
): Promise<UserWithCredentials> {
  const existingUser = await db.users.getByEmail(email)

  if (existingUser) {
    logger.debug('Resolved existing user for authentication', {
      userId: existingUser.id,
    })
    return existingUser
  }

  const invite = await db.userInvites.takePendingByEmail(email)

  if (!invite) {
    logger.warn('User resolution found no user or pending invite', {})
    throw new ApiError(
      ErrorCode.UserNotFound,
      'No registered or invited user exists for this email',
    )
  }

  const userId = createId('user')

  logger.debug('Creating user from pending invite', {
    inviteId: invite.id,
    userId,
  })

  try {
    const user = await db.users.insert({
      id: userId,
      email: invite.email,
      isAdmin: false,
      passkeyCredentials: [],
    })

    logger.debug('Created user from pending invite', {
      inviteId: invite.id,
      userId: user.id,
    })

    return user
  } catch (error) {
    logger.error('User creation from pending invite failed', {
      inviteId: invite.id,
      userId,
      error: serializeError(error),
    })
    throw error
  }
}
