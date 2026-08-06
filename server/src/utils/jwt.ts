import { sign } from 'hono/jwt'
import type { Bindings } from '../bindings'
import type { User } from '../models/user'

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

export async function createJwtForUser(
  user: User,
  bindings: JwtBindings,
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
    requireSecret(bindings.JWT_SECRET),
    'HS256',
  )
}
