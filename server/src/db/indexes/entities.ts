import type { Collection } from 'mongoose'
import { ensureSearchIndex } from './search'

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
    entities.createIndex({ doi: 1 }, { name: 'entity_doi' }),
    entities.createIndex({ orcid: 1 }, { name: 'entity_orcid' }),
    entities.createIndex({ ror: 1 }, { name: 'entity_ror' }),
    entities.createIndex({ 'name.value': 1 }, { name: 'entity_name_value' }),
  ])
}
