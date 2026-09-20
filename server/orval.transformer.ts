type JsonObject = Record<string, unknown>

const ENTITY_SCHEMAS = {
  Person: 'idhi:Person',
  Organization: 'idhi:Organization',
  Facility: 'idhi:Facility',
  Project: 'idhi:Project',
  Tool: 'idhi:Tool',
  Service: 'idhi:Service',
  Publication: 'idhi:Publication',
  Event: 'idhi:Event',
  Dataset: 'idhi:Dataset',
  TrainingMaterial: 'idhi:TrainingMaterial',
} as const

const ENTITY_TYPES = new Set<string>(Object.values(ENTITY_SCHEMAS))

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function entityType(properties: JsonObject): unknown {
  const type = properties.type
  if (!isObject(type)) {
    return undefined
  }
  if (typeof type.const === 'string') {
    return type.const
  }

  const values = type.enum
  return Array.isArray(values) && values.length === 1 ? values[0] : undefined
}

function schemas(document: JsonObject): JsonObject {
  const components = document.components
  if (!isObject(components) || !isObject(components.schemas)) {
    throw new Error('OpenAPI components.schemas is required')
  }
  return components.schemas
}

function entityWriteSchema(
  documentSchemas: JsonObject,
  allowNonEmptyId: boolean,
): JsonObject {
  const entity = documentSchemas.Entity
  if (!isObject(entity)) {
    throw new Error('Entity schema is required')
  }

  const oneOf = Object.keys(ENTITY_SCHEMAS).map((name) => {
    const source = documentSchemas[name]
    if (!isObject(source)) {
      throw new Error(`${name} schema is required`)
    }

    const schema = structuredClone(source)
    if (!isObject(schema.properties)) {
      throw new Error(`${name}.properties is required`)
    }

    const sourceId = schema.properties.id
    if (!isObject(sourceId)) {
      throw new Error(`${name}.id is required`)
    }

    schema.required = Array.isArray(schema.required)
      ? schema.required.filter((property) => property !== 'id')
      : schema.required
    schema.properties.id = {
      readOnly: true,
      anyOf: [
        ...(allowNonEmptyId ? [sourceId] : []),
        { type: 'null' },
        { const: '' },
      ],
    }
    return schema
  })

  return {
    oneOf,
    ...(isObject(entity.discriminator)
      ? { discriminator: structuredClone(entity.discriminator) }
      : {}),
  }
}

function setRequestSchema(
  document: JsonObject,
  path: string,
  method: string,
  schemaName: string,
): void {
  const paths = document.paths
  const pathItem = isObject(paths) ? paths[path] : undefined
  const operation = isObject(pathItem) ? pathItem[method] : undefined
  const requestBody = isObject(operation) ? operation.requestBody : undefined
  const content = isObject(requestBody) ? requestBody.content : undefined
  const json = isObject(content) ? content['application/json'] : undefined
  if (!isObject(json)) {
    throw new Error(`${method.toUpperCase()} ${path} JSON request is required`)
  }

  json.schema = { $ref: `#/components/schemas/${schemaName}` }
}

/**
 * Server-side Orval dereferences the remote manifest before applying input
 * transformers and currently loses OpenAPI 3.1 `$ref` sibling annotations in
 * that process. Reapply the canonical `readOnly` annotation to every
 * dereferenced entity ID.
 */
export default function markEntityIdsReadOnly<T extends JsonObject>(
  document: T,
): T {
  const visited = new WeakSet<object>()

  function visit(value: unknown): void {
    if (!value || typeof value !== 'object' || visited.has(value)) {
      return
    }
    visited.add(value)

    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }

    if (!isObject(value)) {
      return
    }
    const schema = value
    const properties = schema.properties
    if (
      isObject(properties) &&
      ENTITY_TYPES.has(String(entityType(properties)))
    ) {
      const id = properties.id
      if (isObject(id)) {
        id.readOnly = true
      }
    }

    Object.values(schema).forEach(visit)
  }

  visit(document)

  const documentSchemas = schemas(document)
  documentSchemas.EntityCreate = entityWriteSchema(documentSchemas, false)
  documentSchemas.EntityUpdate = entityWriteSchema(documentSchemas, true)
  setRequestSchema(document, '/api/v1/entities', 'put', 'EntityCreate')
  setRequestSchema(
    document,
    '/api/v1/entities/{entityId}',
    'post',
    'EntityUpdate',
  )
  setRequestSchema(
    document,
    '/api/v1/entities/suggestions',
    'post',
    'EntityUpdate',
  )

  return document
}
