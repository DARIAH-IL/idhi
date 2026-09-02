import type { mongo } from 'mongoose'
import { CASE_INSENSITIVE_COLLATION } from '../queries/filter.ts'
import { ensureSearchIndex } from './search.ts'

type Collection = mongo.Collection

export const ENTITY_SEARCH_INDEX_NAME = 'entities_search'

const ENTITY_SEARCH_INDEX_DEFINITION = {
  mappings: {
    dynamic: true,
    fields: {
      audit: {
        type: 'document',
        dynamic: false,
      },
      image: [],
    },
  },
}

export async function initializeEntityIndexes(
  entities: Collection,
  entityAudit: Collection,
): Promise<void> {
  await Promise.all([
    ensureSearchIndex(
      entities,
      ENTITY_SEARCH_INDEX_NAME,
      ENTITY_SEARCH_INDEX_DEFINITION,
    ),
    entityAudit.createIndex(
      { entityId: 1, at: -1 },
      { name: 'audit_entity_history' },
    ),
    entities.createIndex({ type: 1 }, { name: 'entity_type' }),
    entities.createIndex(
      { type: 1 },
      { name: 'entity_type_ci', collation: CASE_INSENSITIVE_COLLATION },
    ),
    entities.createIndex({ type: 1, doi: 1 }, { name: 'entity_type_doi' }),
    entities.createIndex({ type: 1, orcid: 1 }, { name: 'entity_type_orcid' }),
    entities.createIndex({ type: 1, ror: 1 }, { name: 'entity_type_ror' }),
    entities.createIndex({ 'name.value': 1 }, { name: 'entity_name_value' }),
    entities.createIndex(
      { 'audit.modifiedAt': -1 },
      { name: 'entity_audit_modified_at' },
    ),
  ])
}
