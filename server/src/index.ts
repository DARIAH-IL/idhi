import type { Bindings } from './bindings'
import { MongoDBConnection } from './do/MongoDBConnection'

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const id = env.MONGO_CONNECTION.idFromName('mongodb-connection')
    const stub = env.MONGO_CONNECTION.get(id)
    return stub.fetch(request)
  },
}

export { MongoDBConnection }
