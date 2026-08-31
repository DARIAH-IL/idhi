import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server'
import { z } from 'zod'
import type { JSONSchema } from 'zod/v4/core'
import { CreateEntityBody } from '../handlers/entities/entities.zod'

interface EntityFieldInfo {
  path: string
  type: string
  description?: string
}

function isSchemaObject(
  node: JSONSchema._JSONSchema | undefined,
): node is JSONSchema.JSONSchema {
  return typeof node === 'object'
}

function unwrap(node: JSONSchema.JSONSchema): JSONSchema.JSONSchema {
  if (node.anyOf && node.anyOf.length > 0) {
    return (
      node.anyOf.find((option) => option.type !== 'null') ??
      node.anyOf[0] ??
      node
    )
  }

  return node
}

function firstItemSchema(
  items: JSONSchema.JSONSchema['items'],
): JSONSchema.JSONSchema | undefined {
  const item = Array.isArray(items) ? items[0] : items

  return isSchemaObject(item) ? item : undefined
}

function flattenFields(
  node: JSONSchema.JSONSchema,
  prefix: string,
  out: EntityFieldInfo[],
): void {
  const resolved = unwrap(node)

  if (resolved.properties) {
    for (const [key, child] of Object.entries(resolved.properties)) {
      if (isSchemaObject(child)) {
        flattenFields(child, prefix ? `${prefix}.${key}` : key, out)
      }
    }
    return
  }

  const itemSchema = firstItemSchema(resolved.items)
  if (itemSchema) {
    flattenFields(unwrap(itemSchema), prefix, out)
    return
  }

  out.push({
    path: prefix,
    type: resolved.type ?? 'unknown',
    description: resolved.description,
  })
}

interface EntityTypeSchema {
  type: string
  jsonSchema: JSONSchema.JSONSchema
}

function entityTypeSchemas(): EntityTypeSchema[] {
  return CreateEntityBody.options.map((option) => {
    const jsonSchema = z.toJSONSchema(option)
    const typeSchema = jsonSchema.properties?.type
    const type = isSchemaObject(typeSchema) ? typeSchema.const : undefined

    if (typeof type !== 'string') {
      throw new Error('Expected entity schema branch to have a type const')
    }

    return { type, jsonSchema }
  })
}

export function registerEntitySchemaResources(server: McpServer): void {
  const typeSchemas = entityTypeSchemas()

  server.registerResource(
    'entity-types',
    'idhi://schema/entity-types',
    {
      title: 'IDHI entity types',
      description:
        'The entity type discriminator values accepted by create_entity, update_entity and the search_entities filter/facets/sort field paths',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            typeSchemas.map((entry) => entry.type),
            null,
            2,
          ),
        },
      ],
    }),
  )

  server.registerResource(
    'entity-type-fields',
    new ResourceTemplate('idhi://schema/entity-types/{type}/fields', {
      list: async () => ({
        resources: typeSchemas.map((entry) => ({
          uri: `idhi://schema/entity-types/${encodeURIComponent(entry.type)}/fields`,
          name: `${entry.type} fields`,
          mimeType: 'application/json',
        })),
      }),
    }),
    {
      title: 'Field paths for one IDHI entity type',
      description:
        'Dot-separated field paths valid as search_entities filter.field, facets entries and sort.property for this entity type',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const type = Array.isArray(variables.type)
        ? variables.type[0]
        : variables.type
      const match = typeSchemas.find((entry) => entry.type === type)

      if (!match) {
        throw new Error(`Unknown entity type: ${type}`)
      }

      const fields: EntityFieldInfo[] = []
      flattenFields(match.jsonSchema, '', fields)

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(fields, null, 2),
          },
        ],
      }
    },
  )
}
