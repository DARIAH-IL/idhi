import { createId } from './id'

const ENTITY_ID_SEGMENTS = {
  'idhi:Person': 'person',
  'idhi:Organization': 'organization',
  'idhi:Facility': 'facility',
  'idhi:Project': 'project',
  'idhi:Tool': 'tool',
  'idhi:Service': 'service',
  'idhi:Publication': 'publication',
  'idhi:Event': 'event',
  'idhi:Dataset': 'dataset',
  'idhi:TrainingMaterial': 'training_material',
} as const

type EntityType = keyof typeof ENTITY_ID_SEGMENTS

export function createEntityId(type: EntityType): string {
  return createId(ENTITY_ID_SEGMENTS[type]).toLowerCase()
}

export function entityIdMatchesType(id: string, type: EntityType): boolean {
  return id.startsWith(`idhi:${ENTITY_ID_SEGMENTS[type]}:`)
}
