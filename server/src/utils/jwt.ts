import { sign } from 'hono/jwt'
import type { Bindings } from '../bindings'
import type { DatabaseService } from '../db/service'
import type { UserWithCredentials } from '../db/models/UserWithCredentials'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import type { User } from '../models/user'
import { createId } from './id'

const DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60

type JwtBindings = Pick<Bindings, 'JWT_EXPIRATION_SECONDS' | 'JWT_SECRET'>

function expirationSeconds(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_EXPIRATION_SECONDS
  }

  const seconds = Number(value)

  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error('JWT_EXPIRATION_SECONDS must be a positive integer')
  }

  return seconds
}

function requireSecret(secret: string): string {
  if (!secret) {
    throw new Error('JWT_SECRET is missing')
  }

  return secret
}

function exposeUser(user: UserWithCredentials): User {
  return {
    id: user.id,
    ...(user.name === undefined ? {} : { name: user.name }),
    email: user.email,
    isAdmin: user.isAdmin,
  }
}

async function resolveUser(
  email: string,
  db: DatabaseService,
): Promise<UserWithCredentials> {
  const existingUser = await db.users.getByEmail(email)

  if (existingUser) {
    return existingUser
  }

  const invite = await db.userInvites.takePendingByEmail(email)

  if (!invite) {
    throw new ApiError(
      ErrorCode.UserNotFound,
      'No registered or invited user exists for this email',
    )
  }

  return db.users.insert({
    id: createId('user'),
    email: invite.email,
    isAdmin: false,
    passkeyCredentials: [],
  })
}

export async function createJwtForEmail(
  email: string,
  db: DatabaseService,
  bindings: JwtBindings,
): Promise<string> {
  const user = exposeUser(await resolveUser(email, db))
  const issuedAt = Math.floor(Date.now() / 1000)

  return sign(
    {
      ...user,
      iat: issuedAt,
      exp: issuedAt + expirationSeconds(bindings.JWT_EXPIRATION_SECONDS),
    },
    requireSecret(bindings.JWT_SECRET),
    'HS256',
  )
}
