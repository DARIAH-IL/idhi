import { sign, verify } from 'hono/jwt'
import { z } from 'zod'
import type { Bindings } from '../bindings'
import type { User } from '../models/user'
import { requiredValue } from './values'

const DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60

const userSchema = z.object({
  id: z.email(),
  name: z.string().optional(),
  email: z.email(),
  isAdmin: z.boolean(),
  groups: z.array(z.string()).default([]),
})

const userClaimsSchema = userSchema.extend({
  exp: z.number(),
})

export function parseUser(value: unknown): User | undefined {
  const result = userSchema.safeParse(value)

  return result.success ? result.data : undefined
}

export interface VerifiedUserJwt {
  user: User
  expiresAtEpochSeconds: number
}

export async function verifyUserJwt(
  jwt: string,
  bindings: Bindings,
): Promise<VerifiedUserJwt | undefined> {
  const jwtSecret = requiredValue(bindings, 'JWT_SECRET')
  let payload

  try {
    payload = await verify(jwt, jwtSecret, 'HS256')
  } catch {
    return undefined
  }

  const result = userClaimsSchema.safeParse(payload)

  if (!result.success) {
    return undefined
  }

  const { exp, ...user } = result.data

  return { user, expiresAtEpochSeconds: exp }
}

export function jwtExpirationSeconds(bindings: Bindings): number {
  return expirationSeconds(bindings.JWT_EXPIRATION_SECONDS)
}

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
      groups: user.groups,
      iat: issuedAt,
      exp: issuedAt + jwtExpirationSeconds(bindings),
    },
    requiredValue(bindings, 'JWT_SECRET'),
    'HS256',
  )
}
