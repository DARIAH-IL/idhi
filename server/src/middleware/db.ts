import type { MiddlewareHandler } from 'hono'
import type { Connection } from 'mongoose'
import { createDatabaseService } from '../db/service'
import { connectToDatabase } from '../db/connection'
import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import { requiredValue } from '../utils/values'
import { serializeError } from './logger'
import type { RequestLogger } from './logger'

async function closeConnection(
  connection: Connection,
  logger: RequestLogger,
): Promise<void> {
  try {
    await connection.close()
  } catch (error) {
    logger.warn('Database connection close failed', {
      error: serializeError(error),
    })
  }
}

function deferConnectionClose(
  response: Response,
  onDone: () => void,
): Response {
  const source = response.body

  if (!source) {
    onDone()
    return response
  }

  const reader = source.getReader()
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read()

        if (done) {
          controller.close()
          onDone()
          return
        }

        controller.enqueue(value)
      } catch (error) {
        controller.error(error)
        onDone()
      }
    },
    cancel(reason) {
      onDone()
      return reader.cancel(reason).catch(() => {})
    },
  })

  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  const connectionString = requiredValue(c.env, 'MONGODB_CONNECTION_STRING')
  const databaseName = requiredValue(c.env, 'MONGODB_DATABASE_NAME')
  const logger = c.get('logger')
  let connection: Connection | undefined
  let closeDeferred = false

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

    await next()

    if (
      connection &&
      c.res.headers.get('content-type')?.includes('text/event-stream')
    ) {
      const activeConnection = connection

      closeDeferred = true
      c.res = deferConnectionClose(c.res, () => {
        void closeConnection(activeConnection, logger)
      })
    }
  } finally {
    if (connection && !closeDeferred) {
      await closeConnection(connection, logger)
    }
  }
}
