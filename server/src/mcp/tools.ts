import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import type { DatabaseService } from '../db/service'
import type { User } from '../models/user'
import {
  createEntity,
  deleteEntity,
  entityFilterSchema,
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

// Orval flattens the recursive OpenAPI filter and emits z.unknown() at its
// recursion boundary. Use the recursive runtime schema so MCP clients receive
// explicit JSON value schemas and recursive references instead of bare `{}`.
const SearchEntitiesInput = SearchEntitiesBody.omit({ filter: true }).extend({
  filter: entityFilterSchema.optional(),
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

function mcpAuditContext(server: McpServer) {
  const client = server.server.getClientVersion()
  return {
    source: 'mcp' as const,
    client: client ? { name: client.name, version: client.version } : undefined,
  }
}

export function registerEntityTools(
  server: McpServer,
  db: DatabaseService,
  user: User | undefined,
): void {
  server.registerTool(
    'get_entity',
    {
      title: 'Get entity',
      description: 'Fetch a single IDHI entity by its ID',
      inputSchema: GetEntityByIdParams,
    },
    async ({ entityId }) =>
      jsonResult(await getEntityOrThrow(db.entities, entityId, user)),
  )

  server.registerTool(
    'search_entities',
    {
      title: 'Search entities',
      description:
        'Search IDHI entities with an optional free-text query, facets, filters, sorting, and pagination. Always call this before create_entity to check for an existing match and avoid duplicates, especially for entities that other entities will reference (e.g. persons, organizations, publications). Search by name/label, and also by a known external identifier when one is available (e.g. DOI for publications/datasets/tools, ROR for organizations, ORCID for persons) — identifier matches are the most reliable way to find an existing entity.',
      inputSchema: SearchEntitiesInput,
    },
    async (input) => jsonResult(await searchEntities(db.entities, input, user)),
  )

  server.registerTool(
    'create_entity',
    {
      title: 'Create entity',
      description:
        'Create a new IDHI entity (requires authentication). Before calling this, use search_entities to check whether a matching entity already exists and reuse its ID instead — search by name/label and by any known external identifier (DOI, ROR, ORCID) the new entity would have. This is critical for entities that will be referenced by other entities, since duplicates fragment references and break data integrity.',
      inputSchema: CreateEntityBody.superRefine(
        refineUniqueLangStringLanguages,
      ),
    },
    async (input) =>
      jsonResult(
        await createEntity(
          db.entities,
          input,
          requireUser(user).id,
          false,
          mcpAuditContext(server),
        ),
      ),
  )

  server.registerTool(
    'update_entity',
    {
      title: 'Update entity',
      description:
        'Replace an existing IDHI entity by its ID (requires authentication)',
      inputSchema: UpdateEntityInput,
    },
    async ({ entityId, entity }) => {
      const authenticatedUser = requireUser(user)
      return jsonResult(
        await updateEntity(
          db.entities,
          entityId,
          entity,
          authenticatedUser.id,
          false,
          authenticatedUser,
          mcpAuditContext(server),
        ),
      )
    },
  )

  server.registerTool(
    'delete_entity',
    {
      title: 'Delete entity',
      description: 'Delete an IDHI entity by its ID (requires authentication)',
      inputSchema: DeleteEntityByIdParams,
    },
    async ({ entityId }) => {
      await deleteEntity(
        db.entities,
        entityId,
        requireUser(user),
        mcpAuditContext(server),
      )

      return jsonResult({ deleted: true, entityId })
    },
  )
}
