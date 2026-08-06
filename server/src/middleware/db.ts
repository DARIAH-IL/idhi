import type { MiddlewareHandler } from 'hono'
import { createDatabaseService } from '../db/service'
import { connectToDatabase } from '../db/connection'
import { Bindings } from '../bindings'

export const databaseMiddleware: MiddlewareHandler<{
  Bindings: Bindings
}> = async (c, next) => {
  let connectionString = c.env.MONGODB_CONNECTION_STRING
  if (!connectionString) {
    throw new Error('MONGODB_CONNECTION_STRING is missing')
  }
  c.set(
    'db',
    await createDatabaseService(await connectToDatabase(connectionString)),
  )
  return next()
}
