import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import type { DatabaseService } from '../db/service'
import type { User } from '../models/user'
import {
  createEntity,
  deleteEntity,
  getEntityOrThrow,
  searchEntities,
  updateEntity,
} from '../utils/entityOps'
import { refineUniqueLangStringLanguages } from '../utils/langString'
import {
  SearchEntitiesBody,
  CreateEntityBody,
  GetEntityByIdParams,
  UpdateEntityByIdBody,
  DeleteEntityByIdParams,
} from '../handlers/entities/entities.zod'

export const WRITE_TOOL_NAMES: ReadonlySet<string> = new Set([
  'create_entity',
  'update_entity',
  'delete_entity',
])

const UpdateEntityInput = z.object({
  entityId: z.string().min(1),
  entity: UpdateEntityByIdBody.superRefine(refineUniqueLangStringLanguages),
})

function jsonResult(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  }
}

function requireUser(user: User | undefined): User {
  if (!user) {
    throw new Error('Authentication is required to use this tool')
  }

  return user
}

export function createEntityMcpServer(
  db: DatabaseService,
  user: User | undefined,
): McpServer {
  const server = new McpServer({
    name: 'idhi',
    version: '1.0.0',
  })

  server.registerTool(
    'get_entity',
    {
      title: 'Get entity',
      description: 'Fetch a single IDHI entity by its ID',
      inputSchema: GetEntityByIdParams,
    },
    async ({ entityId }) =>
      jsonResult(await getEntityOrThrow(db.entities, entityId)),
  )

  server.registerTool(
    'search_entities',
    {
      title: 'Search entities',
      description:
        'Search IDHI entities with an optional free-text query, facets, filters, sorting, and pagination',
      inputSchema: SearchEntitiesBody,
    },
    async (input) => jsonResult(await searchEntities(db.entities, input)),
  )

  server.registerTool(
    'create_entity',
    {
      title: 'Create entity',
      description: 'Create a new IDHI entity (requires authentication)',
      inputSchema: CreateEntityBody.superRefine(
        refineUniqueLangStringLanguages,
      ),
    },
    async (input) =>
      jsonResult(await createEntity(db.entities, input, requireUser(user).id)),
  )

  server.registerTool(
    'update_entity',
    {
      title: 'Update entity',
      description:
        'Replace an existing IDHI entity by its ID (requires authentication)',
      inputSchema: UpdateEntityInput,
    },
    async ({ entityId, entity }) =>
      jsonResult(
        await updateEntity(db.entities, entityId, entity, requireUser(user).id),
      ),
  )

  server.registerTool(
    'delete_entity',
    {
      title: 'Delete entity',
      description: 'Delete an IDHI entity by its ID (requires authentication)',
      inputSchema: DeleteEntityByIdParams,
    },
    async ({ entityId }) => {
      await deleteEntity(db.entities, entityId, requireUser(user).id)

      return jsonResult({ deleted: true, entityId })
    },
  )

  return server
}
