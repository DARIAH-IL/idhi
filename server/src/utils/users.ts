import type { Bindings } from '../bindings'
import type { DatabaseService } from '../db/service'
import type { UserWithCredentials } from '../db/models/UserWithCredentials'
import { defaultLang } from '../emails/localization'
import { ApiError } from '../errors/ApiError'
import { serializeError } from '../middleware/logger'
import type { RequestLogger } from '../middleware/logger'
import { ErrorCode } from '../models/errorCode'
import { sendNewUserNotificationEmails } from './email'

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

async function notifyAdminsOfNewUser(
  newUserEmail: string,
  db: DatabaseService,
  logger: RequestLogger,
  bindings: Bindings,
): Promise<void> {
  try {
    const adminEmails = await db.users.listAdminEmails()

    if (adminEmails.length === 0) {
      logger.warn('No admins to notify about a new user', { newUserEmail })
      return
    }

    await sendNewUserNotificationEmails(
      adminEmails,
      newUserEmail,
      defaultLang(bindings.DEFAULT_LANG),
      bindings,
    )

    logger.debug('Notified admins about a new user', {
      newUserEmail,
      recipients: adminEmails.length,
    })
  } catch (error) {
    logger.error('New user admin notification failed', {
      newUserEmail,
      error: serializeError(error),
    })
  }
}

export async function createInvitedUserAfterAuthentication(
  email: string,
  db: DatabaseService,
  logger: RequestLogger,
  bindings: Bindings,
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

  logger.debug('Creating user from pending invite', {
    inviteId: invite.id,
    email: invite.email,
  })

  try {
    const user = await db.users.insert({
      email: invite.email,
      isAdmin: false,
      groups: [],
      passkeyCredentials: [],
    })

    logger.debug('Created user from pending invite', {
      inviteId: invite.id,
      userId: user.id,
    })

    await notifyAdminsOfNewUser(user.email, db, logger, bindings)

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
        email: invite.email,
        error: serializeError(restoreError),
      })
    }

    logger.error('User creation from pending invite failed', {
      inviteId: invite.id,
      email: invite.email,
      inviteRestored,
      error: serializeError(error),
    })
    throw error
  }
}
