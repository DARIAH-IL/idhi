import type { MiddlewareHandler } from 'hono'
import type { Connection } from 'mongoose'
import { createDatabaseService } from '../db/service'
import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  const connectionPromise = c.env.MONGO_CONNECTION_PROMISE

  if (!connectionPromise) {
    throw new Error('MONGO_CONNECTION_PROMISE is missing')
  }

  let connection: Connection

  try {
    connection = await connectionPromise
  } catch (error) {
    if (c.req.method === 'GET' && c.req.path === '/api/v1/health') {
      throw new ApiError(ErrorCode.InvalidInput, 'Database is unavailable', 503)
    }

    throw error
  }

  const databaseService = await createDatabaseService(connection)
  c.set('db', databaseService)
  await next()
}
