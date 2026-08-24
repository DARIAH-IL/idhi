import type { MiddlewareHandler } from 'hono'
import type { Connection } from 'mongoose'
import { createDatabaseService } from '../db/service'
import { connectToDatabase } from '../db/connection'
import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import { requiredValue } from '../utils/values'
import { serializeError } from './logger'

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  const connectionString = requiredValue(c.env, 'MONGODB_CONNECTION_STRING')
  const databaseName = requiredValue(c.env, 'MONGODB_DATABASE_NAME')
  const logger = c.get('logger')
  let connection: Connection | undefined

  try {
    try {
      connection = await connectToDatabase(connectionString, databaseName)
      const databaseService = await createDatabaseService(connection)
      c.set('db', databaseService)
    } catch (error) {
      if (c.req.method === 'GET' && c.req.path === '/api/v1/health') {
        throw new ApiError(
          ErrorCode.InvalidInput,
          'Database is unavailable',
          503,
        )
      }

      throw error
    }

    return await next()
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (error) {
        logger.warn('Database connection close failed', {
          error: serializeError(error),
        })
      }
    }
  }
}
