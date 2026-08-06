import type { DatabaseService } from './db/service'
import type { User } from './models/user'
import type { RequestLogger } from './middleware/logger'
import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    db: DatabaseService
    requestId: string
    logger: RequestLogger
    user?: User
  }
}
