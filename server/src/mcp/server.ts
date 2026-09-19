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
  const server = new McpServer(
    {
      name: 'idhi',
      version: OPENAPI_VERSION,
    },
    {
      instructions:
        'Before calling create_entity, always call search_entities first to check whether a matching entity already exists, to avoid creating duplicates. This is especially important for entities that will be referenced by other entities (e.g. persons, organizations, publications) — search by name/label first, and whenever a known external identifier is available (e.g. DOI for publications/datasets/tools, ROR for organizations, ORCID for persons), search by that identifier too, since it is the most reliable way to find an existing match. Reuse the existing entity ID instead of creating a new one whenever a match is found.',
    },
  )

  registerEntitySchemaResources(server)
  registerEntityTools(server, db, user)

  return server
}
