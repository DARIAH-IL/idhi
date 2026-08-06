import { sign } from 'hono/jwt'
import type { Bindings } from '../bindings'
import type { User } from '../models/user'
import { requiredValue } from './values'

const DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60

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

export async function createJwtForUser(
  user: User,
  bindings: Bindings,
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)

  return sign(
    {
      id: user.id,
      ...(user.name === undefined ? {} : { name: user.name }),
      email: user.email,
      isAdmin: user.isAdmin,
      iat: issuedAt,
      exp: issuedAt + expirationSeconds(bindings.JWT_EXPIRATION_SECONDS),
    },
    requiredValue(bindings, 'JWT_SECRET'),
    'HS256',
  )
}
