import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '../bindings'
import { ErrorCode } from '../models/errorCode'
import type { Error as ErrorResponse } from '../models/error'
import type { User } from '../models/user'
import { verifyUserJwt } from '../utils/jwt'

function isPathWithin(path: string, basePath: string): boolean {
  return path === basePath || path.startsWith(`${basePath}/`)
}

function unauthorized(message: string): Response {
  const error: ErrorResponse = {
    errorCode: ErrorCode.Unauthorized,
    message,
  }

  return Response.json(error, { status: 400 })
}

function requireAuthenticated(user: User | undefined): Response | undefined {
  if (!user) {
    return unauthorized('Authentication required')
  }
}

function requireAdmin(user: User): Response | undefined {
  if (!user.isAdmin) {
    return unauthorized('Administrator access required')
  }
}

export async function getUserFromAuthorizationHeader(
  authorizationHeader: string | undefined,
  bindings: Bindings,
): Promise<User | undefined> {
  const jwt = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!jwt) {
    return undefined
  }

  return (await verifyUserJwt(jwt, bindings))?.user
}

export function assertAuthenticatedUser(
  user: User | undefined,
): asserts user is User {
  if (!user) {
    throw new Error('Authenticated user is missing from the Hono context')
  }
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (
  c,
  next,
) => {
  const { method, path } = c.req
  const getAuthenticatedUser = async () => {
    const user = await getUserFromAuthorizationHeader(
      c.req.header('Authorization'),
      c.env,
    )

    if (user) {
      c.set('user', user)
    }

    return user
  }
  const logResolution = (resolution: string) =>
    c.get('logger').debug('Authorization resolved', {
      method,
      path,
      resolution,
    })
  const authorizeAdmin = async (
    scope: string,
  ): Promise<Response | undefined> => {
    const tokenUser = await getAuthenticatedUser()

    if (!tokenUser) {
      logResolution(`${scope}_unauthenticated`)
      return unauthorized('Authentication required')
    }

    const storedUser = await c.var.db.users.get(tokenUser.id)

    if (!storedUser) {
      logResolution(`${scope}_user_not_found`)
      return unauthorized('Authentication required')
    }

    const user: User = {
      id: storedUser.id,
      email: storedUser.email,
      isAdmin: storedUser.isAdmin,
      ...(storedUser.name ? { name: storedUser.name } : {}),
    }
    c.set('user', user)

    const response = requireAdmin(user)

    if (response) {
      logResolution(`${scope}_not_admin`)
      return response
    }

    logResolution(`${scope}_admin`)
  }

  if (method === 'GET' && path === '/api/v1/health') {
    logResolution('health_allowed')
    return next()
  }

  if (isPathWithin(path, '/api/v1/auth')) {
    if (isPathWithin(path, '/api/v1/auth/passkey/create')) {
      const response = requireAuthenticated(await getAuthenticatedUser())

      if (response) {
        logResolution('passkey_create_unauthenticated')
        return response
      }

      logResolution('passkey_create_authenticated')
      return next()
    }

    if (await getAuthenticatedUser()) {
      logResolution('auth_authenticated')
      return unauthorized('Authentication routes require an anonymous user')
    }

    logResolution('auth_anonymous')
    return next()
  }

  if (method === 'POST' && path === '/oauth/authorize') {
    const response = requireAuthenticated(await getAuthenticatedUser())

    if (response) {
      logResolution('oauth_authorize_unauthenticated')
      return response
    }

    logResolution('oauth_authorize_authenticated')
    return next()
  }

  if (isPathWithin(path, '/api/v1/entities')) {
    const isPublicEntityRead =
      method === 'GET' || (method === 'POST' && path === '/api/v1/entities')

    if (isPublicEntityRead) {
      logResolution('entity_read_allowed')
      return next()
    }

    const response = requireAuthenticated(await getAuthenticatedUser())

    if (response) {
      logResolution('entity_write_unauthenticated')
      return response
    }

    logResolution('entity_write_authenticated')
    return next()
  }

  if (
    isPathWithin(path, '/api/v1/users/invite') ||
    isPathWithin(path, '/api/v1/users/invites')
  ) {
    const response = await authorizeAdmin('user_invites')

    return response ?? next()
  }

  if (isPathWithin(path, '/api/v1/users')) {
    const response = await authorizeAdmin('user_management')

    return response ?? next()
  }

  logResolution('route_blocked')
  return unauthorized('Route not allowed')
}
