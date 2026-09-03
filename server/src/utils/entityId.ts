import type { Entity } from '../models'
import { createId } from './id'

type EntityType = Entity['type']

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
} as const satisfies Record<EntityType, string>

const ENTITY_ID_SEGMENT_SET = new Set<string>(Object.values(ENTITY_ID_SEGMENTS))
const ENTITY_ID_RANDOM_SEGMENT_PATTERN = /^[0-9a-z]{4,12}$/

export function createEntityId(type: EntityType): string {
  return createId(ENTITY_ID_SEGMENTS[type]).toLowerCase()
}

export function entityIdMatchesType(id: string, type: EntityType): boolean {
  return id.startsWith(`idhi:${ENTITY_ID_SEGMENTS[type]}:`)
}

export function isEntityId(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const [namespace, type, random, extra] = value.split(':')
  return (
    namespace === 'idhi' &&
    type !== undefined &&
    ENTITY_ID_SEGMENT_SET.has(type) &&
    random !== undefined &&
    ENTITY_ID_RANDOM_SEGMENT_PATTERN.test(random) &&
    extra === undefined
  )
}
