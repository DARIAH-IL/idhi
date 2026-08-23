import type { AuditedEntity, Entity, UiLanguage } from '@/api/models'
import i18n from '@/i18n'
import { useUIStore } from '@/stores/ui'

export type EntityType = Entity['type']

export const ENTITY_TYPES = [
  'idhi:Person',
  'idhi:Organization',
  'idhi:Facility',
  'idhi:Project',
  'idhi:Tool',
  'idhi:Service',
  'idhi:Publication',
  'idhi:Event',
  'idhi:Dataset',
  'idhi:TrainingMaterial',
] as const satisfies readonly EntityType[]

const ENTITY_TYPE_METADATA = {
  'idhi:Person': { idSegment: 'person' },
  'idhi:Organization': { idSegment: 'organization' },
  'idhi:Facility': { idSegment: 'facility' },
  'idhi:Project': { idSegment: 'project' },
  'idhi:Tool': { idSegment: 'tool' },
  'idhi:Service': { idSegment: 'service' },
  'idhi:Publication': { idSegment: 'publication' },
  'idhi:Event': { idSegment: 'event' },
  'idhi:Dataset': { idSegment: 'dataset' },
  'idhi:TrainingMaterial': { idSegment: 'training_material' },
} as const satisfies Record<EntityType, { idSegment: string }>

interface LocalizedValue {
  language: string
  value: string
}

function getCurrentLanguage(): UiLanguage {
  return useUIStore.getState().language
}

function pickLocalizedValue(
  items: readonly LocalizedValue[] | null | undefined,
): string | undefined {
  if (!items?.length) {
    return undefined
  }

  const language = getCurrentLanguage()
  return (
    items.find((item) => item.language === language)?.value ??
    items.find((item) => item.language === 'en')?.value ??
    items[0]?.value
  )
}

export function getEntityDisplayName(entity: Entity): string {
  if (entity.type !== 'idhi:Person') {
    return pickLocalizedValue(entity.name) ?? entity.id
  }

  const name = [
    pickLocalizedValue(entity.given_name),
    pickLocalizedValue(entity.family_name),
  ]
    .filter((part): part is string => Boolean(part))
    .join(' ')

  return name || entity.id
}

export function getEntityDescription(entity: Entity): string | undefined {
  return pickLocalizedValue(entity.description)
}

export function getEntityTypeLabel(type: EntityType): string {
  return i18n.t(`entity.types.${type}`)
}

export function getEntityIdSegment(type: EntityType): string {
  return ENTITY_TYPE_METADATA[type].idSegment
}

export function auditedEntityId(entity: AuditedEntity): string {
  return entity.id
}
