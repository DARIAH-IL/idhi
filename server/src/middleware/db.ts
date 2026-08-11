import type { MiddlewareHandler } from 'hono'
import { createDatabaseService } from '../db/service'
import { connectToDatabase } from '../db/connection'
import { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import { requiredValue } from '../utils/values'

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  const connectionString = requiredValue(c.env, 'MONGODB_CONNECTION_STRING')
  const databaseName = requiredValue(c.env, 'MONGODB_DATABASE_NAME')

  try {
    c.set(
      'db',
      await createDatabaseService(
        await connectToDatabase(connectionString, databaseName),
      ),
    )
  } catch (error) {
    if (c.req.method === 'GET' && c.req.path === '/api/v1/health') {
      throw new ApiError(ErrorCode.InvalidInput, 'Database is unavailable', 503)
    }

    throw error
  }

  return next()
}
