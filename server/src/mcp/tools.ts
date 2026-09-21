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
  GetEntityByIdParams,
  DeleteEntityByIdParams,
} from '../handlers/entities/entities.zod'
import {
  CreateEntityBodyNoImage,
  UpdateEntityByIdBodyNoImage,
  extendEntityUnion,
  withoutDraftFlag,
} from '../handlers/entities/entities.mcp.handlers'

export const WRITE_TOOL_NAMES: ReadonlySet<string> = new Set([
  'create_entity',
  'update_entity',
  'delete_entity',
])

const CreateEntityInput = extendEntityUnion(CreateEntityBodyNoImage, {
  isDraft: z
    .boolean()
    .default(true)
    .describe(
      'Whether to save the entity as a draft, visible only to its creator and administrators, instead of publishing it. Defaults to true: create entities as drafts so a human can review them before they become public. Only pass false when the user explicitly asked for the entity to be published right away. Publishing is irreversible — a published entity can never be turned back into a draft.',
    ),
}).superRefine(refineUniqueLangStringLanguages)

const UpdateEntityInput = z.object({
  entityId: z.string().min(1),
  entity: UpdateEntityByIdBodyNoImage.superRefine(
    refineUniqueLangStringLanguages,
  ),
  isDraft: z
    .boolean()
    .default(true)
    .describe(
      'Whether the entity should remain a draft. Defaults to true, which keeps the entity as it is: a draft stays a draft and a published entity stays published. Only pass false when the user explicitly asked to publish the entity, which turns a draft into a published entity. Publishing is irreversible — a published entity can never be turned back into a draft.',
    ),
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

function stripImage<T extends { image?: string | null }>(entity: T): T {
  if (entity.image === undefined) {
    return entity
  }
  return { ...entity, image: undefined }
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
      jsonResult(
        stripImage(await getEntityOrThrow(db.entities, entityId, user)),
      ),
  )

  server.registerTool(
    'search_entities',
    {
      title: 'Search entities',
      description:
        'Search IDHI entities with an optional free-text query, facets, filters, sorting, and pagination. Always call this before create_entity to check for an existing match and avoid duplicates, especially for entities that other entities will reference (e.g. persons, organizations, publications). Search by name/label, and also by a known external identifier when one is available (e.g. DOI for publications/datasets/tools, ROR for organizations, ORCID for persons) — identifier matches are the most reliable way to find an existing entity.',
      inputSchema: SearchEntitiesInput,
    },
    async (input) => {
      const result = await searchEntities(db.entities, input, user)
      return jsonResult({
        ...result,
        results: result.results.map(stripImage),
      })
    },
  )

  server.registerTool(
    'create_entity',
    {
      title: 'Create entity',
      description:
        'Create a new IDHI entity (requires authentication). The entity is created as a draft unless isDraft is explicitly set to false. Before calling this, use search_entities to check whether a matching entity already exists and reuse its ID instead — search by name/label and by any known external identifier (DOI, ROR, ORCID) the new entity would have. This is critical for entities that will be referenced by other entities, since duplicates fragment references and break data integrity.',
      inputSchema: CreateEntityInput,
    },
    async (input) =>
      jsonResult(
        stripImage(
          await createEntity(
            db.entities,
            // Ignore any image the client supplied
            { ...withoutDraftFlag(input), image: undefined },
            requireUser(user).id,
            input.isDraft,
            mcpAuditContext(server),
          ),
        ),
      ),
  )

  server.registerTool(
    'update_entity',
    {
      title: 'Update entity',
      description:
        'Replace an existing IDHI entity by its ID (requires authentication). A draft stays a draft unless isDraft is explicitly set to false, which publishes it.',
      inputSchema: UpdateEntityInput,
    },
    async ({ entityId, entity, isDraft }) => {
      const authenticatedUser = requireUser(user)

      const current = await db.entities.get(entityId, authenticatedUser)
      const entityWithPreservedImage = {
        ...entity,
        image: current?.image ?? null,
      }

      return jsonResult(
        stripImage(
          await updateEntity(
            db.entities,
            entityId,
            entityWithPreservedImage,
            authenticatedUser.id,
            isDraft,
            authenticatedUser,
            mcpAuditContext(server),
          ),
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
