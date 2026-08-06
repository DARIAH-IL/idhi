import type { MiddlewareHandler } from 'hono'
import { createDatabaseService } from '../db/service'
import { connectToDatabase } from '../db/connection'
import { Bindings } from '../bindings'
import { requiredValue } from '../utils/values'

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  const connectionString = requiredValue(c.env, 'MONGODB_CONNECTION_STRING')
  c.set(
    'db',
    await createDatabaseService(await connectToDatabase(connectionString)),
  )
  return next()
}
