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
  'idhi:Person': { idSegment: 'person', className: 'Person' },
  'idhi:Organization': { idSegment: 'organization', className: 'Organization' },
  'idhi:Facility': { idSegment: 'facility', className: 'Facility' },
  'idhi:Project': { idSegment: 'project', className: 'Project' },
  'idhi:Tool': { idSegment: 'tool', className: 'Tool' },
  'idhi:Service': { idSegment: 'service', className: 'Service' },
  'idhi:Publication': { idSegment: 'publication', className: 'Publication' },
  'idhi:Event': { idSegment: 'event', className: 'Event' },
  'idhi:Dataset': { idSegment: 'dataset', className: 'Dataset' },
  'idhi:TrainingMaterial': {
    idSegment: 'training_material',
    className: 'TrainingMaterial',
  },
} as const satisfies Record<
  EntityType,
  { idSegment: string; className: string }
>

type EntityOf<T extends EntityType> = Extract<Entity, { type: T }>

type DisplayField<T extends EntityType> = Exclude<
  Extract<keyof EntityOf<T>, string>,
  'type' | 'id' | 'image' | 'tags'
>

const ENTITY_FIELD_ORDER = {
  'idhi:Person': {
    given_name: 0,
    family_name: 1,
    description: 2,
    affiliations: 3,
    emails: 4,
    homepage: 5,
    orcid: 6,
    same_as: 7,
  },
  'idhi:Organization': {
    name: 0,
    organization_type: 1,
    description: 2,
    location: 3,
    address: 4,
    contact_email: 5,
    homepage: 6,
    additional_urls: 7,
    ror: 8,
    organization_hierarchy: 9,
    marketplace_sync: 10,
    same_as: 11,
  },
  'idhi:Facility': {
    name: 0,
    description: 1,
    facility_affiliations: 2,
    location: 3,
    address: 4,
    contact_email: 5,
    homepage: 6,
    additional_urls: 7,
    services_offered: 8,
    tools_provided: 9,
    same_as: 10,
  },
  'idhi:Project': {
    name: 0,
    description: 1,
    digital_humanities_activities: 2,
    research_disciplines: 3,
    studied_periods: 4,
    studied_places: 5,
    start_date: 6,
    end_date: 7,
    funding_status: 8,
    funding: 9,
    organization_roles: 10,
    project_participations: 11,
    outputs_publications: 12,
    outputs_datasets: 13,
    outputs_tools: 14,
    outputs_training_materials: 15,
    uses_datasets: 16,
    uses_services: 17,
    uses_tools: 18,
    contact_email: 19,
    homepage: 20,
    additional_urls: 21,
    same_as: 22,
  },
  'idhi:Tool': {
    name: 0,
    tool_type: 1,
    description: 2,
    digital_humanities_activities: 3,
    programming_language: 4,
    license: 5,
    doi: 6,
    homepage: 7,
    documentation_url: 8,
    code_repository: 9,
    additional_urls: 10,
    contact_email: 11,
    resource_contributions: 12,
    same_as: 13,
  },
  'idhi:Service': {
    name: 0,
    service_type: 1,
    description: 2,
    digital_humanities_activities: 3,
    provider: 4,
    homepage: 5,
    documentation_url: 6,
    additional_urls: 7,
    contact_email: 8,
    same_as: 9,
  },
  'idhi:Publication': {
    name: 0,
    publication_type: 1,
    description: 2,
    authorships: 3,
    date_issued: 4,
    published_in: 5,
    part_of: 6,
    presented_at: 7,
    publisher: 8,
    doi: 9,
    homepage: 10,
    same_as: 11,
  },
  'idhi:Event': {
    name: 0,
    event_type: 1,
    description: 2,
    start_date: 3,
    end_date: 4,
    location: 5,
    address: 6,
    event_agent_roles: 7,
    contact_email: 8,
    homepage: 9,
    additional_urls: 10,
    same_as: 11,
  },
  'idhi:Dataset': {
    name: 0,
    dataset_type: 1,
    description: 2,
    themes: 3,
    date_issued: 4,
    publisher: 5,
    license: 6,
    in_languages: 7,
    media_type: 8,
    byte_size: 9,
    extent: 10,
    distribution_url: 11,
    doi: 12,
    homepage: 13,
    derived_from: 14,
    datasets: 15,
    related_publications: 16,
    resource_contributions: 17,
    same_as: 18,
  },
  'idhi:TrainingMaterial': {
    name: 0,
    training_material_type: 1,
    description: 2,
    digital_humanities_activities: 3,
    creators: 4,
    publisher: 5,
    date_issued: 6,
    educational_level: 7,
    target_audiences: 8,
    prerequisites: 9,
    learning_outcomes: 10,
    in_languages: 11,
    media_type: 12,
    license: 13,
    material_url: 14,
    homepage: 15,
    doi: 16,
    additional_urls: 17,
    part_of_training_material: 18,
    related_tools: 19,
    related_services: 20,
    related_datasets: 21,
    contact_email: 22,
    same_as: 23,
  },
} satisfies { [T in EntityType]: Record<DisplayField<T>, number> }

export function getEntityFieldOrder(
  type: EntityType,
): Record<string, number | undefined> {
  return ENTITY_FIELD_ORDER[type]
}

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
  const labels: Record<string, string> = i18n.t('entity.types', {
    returnObjects: true,
  })
  return labels[type] ?? type
}

export function getEntityFieldLabelText(
  entityClass: string,
  field: string,
): string {
  const allFields: Record<
    string,
    Record<string, { label?: string } | undefined> | undefined
  > = i18n.t('entity.fields', { returnObjects: true })
  return allFields[entityClass]?.[field]?.label ?? field.replaceAll('_', ' ')
}

export function getEnumValueLabel(value: string): string {
  const labels: Record<string, string> = i18n.t('entity.enums', {
    returnObjects: true,
  })
  return labels[value] ?? value
}

export type EntityClassName =
  (typeof ENTITY_TYPE_METADATA)[EntityType]['className']

export function getEntityClassName(type: EntityType): EntityClassName {
  return ENTITY_TYPE_METADATA[type].className
}

export function getEntityIdSegment(type: EntityType): string {
  return ENTITY_TYPE_METADATA[type].idSegment
}

export function auditedEntityId(entity: AuditedEntity): string {
  return entity.id
}
