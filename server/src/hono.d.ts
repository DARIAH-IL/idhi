import type { User } from './models/user'
import type { RequestLogger } from './middleware/logger'
import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    requestId: string
    logger: RequestLogger
    user?: User
  }
}
