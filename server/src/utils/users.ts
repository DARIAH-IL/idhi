import type { DatabaseService } from '../db/service'
import type { UserWithCredentials } from '../db/models/UserWithCredentials'
import { ApiError } from '../errors/ApiError'
import { serializeError, type RequestLogger } from '../middleware/logger'
import { ErrorCode } from '../models/errorCode'
import { createId } from './id'

export type AuthenticationTarget = {
  email: string
  user: UserWithCredentials | null
}

function inviteIsPending(expiration: string): boolean {
  return expiration > new Date().toISOString()
}

export async function resolveAuthenticationTarget(
  email: string,
  db: DatabaseService,
  logger: RequestLogger,
): Promise<AuthenticationTarget> {
  const existingUser = await db.users.getByEmail(email)

  if (existingUser) {
    logger.debug('Resolved existing user for authentication', {
      userId: existingUser.id,
    })
    return { email: existingUser.email, user: existingUser }
  }

  const invite = await db.userInvites.getByEmail(email)

  if (!invite || !inviteIsPending(invite.expiration)) {
    logger.warn('User resolution found no user or pending invite', {})
    throw new ApiError(
      ErrorCode.UserNotFound,
      'No registered or invited user exists for this email',
    )
  }

  return { email: invite.email, user: null }
}

export async function createInvitedUserAfterAuthentication(
  email: string,
  db: DatabaseService,
  logger: RequestLogger,
): Promise<UserWithCredentials> {
  const existingUser = await db.users.getByEmail(email)

  if (existingUser) {
    return existingUser
  }

  const invite = await db.userInvites.takePendingByEmail(email)

  if (!invite) {
    const concurrentlyCreatedUser = await db.users.getByEmail(email)

    if (concurrentlyCreatedUser) {
      return concurrentlyCreatedUser
    }

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
    const concurrentlyCreatedUser = await db.users.getByEmail(email)

    if (concurrentlyCreatedUser) {
      return concurrentlyCreatedUser
    }

    let inviteRestored = false

    try {
      if (!(await db.userInvites.getByEmail(invite.email))) {
        await db.userInvites.add(invite)
        inviteRestored = true
      }
    } catch (restoreError) {
      logger.error('User invite restoration failed', {
        inviteId: invite.id,
        userId,
        error: serializeError(restoreError),
      })
    }

    logger.error('User creation from pending invite failed', {
      inviteId: invite.id,
      userId,
      inviteRestored,
      error: serializeError(error),
    })
    throw error
  }
}
