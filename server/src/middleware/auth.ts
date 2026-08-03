import type { MiddlewareHandler } from 'hono'
import { ErrorCode } from '../models/errorCode'
import type { Error as ErrorResponse } from '../models/error'
import type { User } from '../models/user'

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

async function getUserFromJwt(jwt: string): Promise<User | undefined> {
  // TODO - implement this!!!
  return undefined
}

async function getUserFromAuthorizationHeader(
  authorizationHeader: string | undefined,
): Promise<User | undefined> {
  const jwt = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!jwt) {
    return undefined
  }

  return getUserFromJwt(jwt)
}

export function assertAuthenticatedUser(
  user: User | undefined,
): asserts user is User {
  if (!user) {
    throw new Error('Authenticated user is missing from the Hono context')
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const { method, path } = c.req
  const getAuthenticatedUser = async () => {
    const user = await getUserFromAuthorizationHeader(
      c.req.header('Authorization'),
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

  if (method === 'GET' && path === '/api/v1/health') {
    logResolution('health_allowed')
    return next()
  }

  if (isPathWithin(path, '/api/v1/entities')) {
    if (method === 'GET') {
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

  if (isPathWithin(path, '/api/v1/users')) {
    const user = await getAuthenticatedUser()

    if (!user) {
      logResolution('user_management_unauthenticated')
      return unauthorized('Authentication required')
    }

    const adminResponse = requireAdmin(user)

    if (adminResponse) {
      logResolution('user_management_not_admin')
      return adminResponse
    }

    logResolution('user_management_admin')
    return next()
  }

  logResolution('route_blocked')
  return unauthorized('Route not allowed')
}
