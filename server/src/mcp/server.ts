import { McpServer } from '@modelcontextprotocol/server'
import type { DatabaseService } from '../db/service'
import type { User } from '../models/user'
import { OPENAPI_VERSION } from './openApiVersion'
import { registerEntitySchemaResources } from './resources'
import { registerEntityTools } from './tools'

export function createEntityMcpServer(
  db: DatabaseService,
  user: User | undefined,
): McpServer {
  const server = new McpServer({
    name: 'idhi',
    version: OPENAPI_VERSION,
  })

  registerEntitySchemaResources(server)
  registerEntityTools(server, db, user)

  return server
}
