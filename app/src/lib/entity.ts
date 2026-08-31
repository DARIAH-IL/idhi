import type { AuditedEntity, Entity, UiLanguage } from '@/api/models'
import type { termUris } from '@/api/termUris/termUris'
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

type TermUriClass = keyof typeof termUris

export const NON_DISPLAY_FIELDS = [
  '$self',
  'type',
  'id',
  'image',
  'tags',
] as const

type NonDisplayField = (typeof NON_DISPLAY_FIELDS)[number]

const NON_DISPLAY_FIELD_SET = new Set<string>(NON_DISPLAY_FIELDS)

export function isNonDisplayField(field: string): field is NonDisplayField {
  return NON_DISPLAY_FIELD_SET.has(field)
}

type DisplayField<TClass extends TermUriClass> = Exclude<
  keyof (typeof termUris)[TClass],
  NonDisplayField
>

type EntityFieldOrderDefinitions = {
  [TClass in TermUriClass]: Record<DisplayField<TClass>, true>
}

const ENTITY_FIELD_ORDER = {
  Affiliation: {
    organization: true,
    affiliation_role: true,
    start_date: true,
    end_date: true,
  },
  Agent: {
    description: true,
    homepage: true,
    same_as: true,
  },
  Authorship: {
    author: true,
    authorship_role: true,
    author_order: true,
    start_date: true,
    end_date: true,
  },
  Dataset: {
    name: true,
    dataset_type: true,
    doi: true,
    description: true,
    homepage: true,
    distribution_url: true,
    date_issued: true,
    themes: true,
    media_type: true,
    in_languages: true,
    publisher: true,
    extent: true,
    byte_size: true,
    license: true,
    derived_from: true,
    datasets: true,
    related_publications: true,
    resource_contributions: true,
    same_as: true,
  },
  Entity: {
    description: true,
    homepage: true,
    same_as: true,
  },
  Event: {
    name: true,
    event_type: true,
    description: true,
    start_date: true,
    end_date: true,
    homepage: true,
    location: true,
    address: true,
    contact_email: true,
    additional_urls: true,
    event_agent_roles: true,
    same_as: true,
  },
  EventAgentRole: {
    event_agent: true,
    event_agent_role: true,
    start_date: true,
    end_date: true,
  },
  Facility: {
    name: true,
    description: true,
    homepage: true,
    location: true,
    address: true,
    contact_email: true,
    additional_urls: true,
    facility_affiliations: true,
    services_offered: true,
    tools_provided: true,
    same_as: true,
  },
  FacilityAffiliation: {
    organization: true,
    facility_affiliation_role: true,
    start_date: true,
    end_date: true,
  },
  Funding: {
    grant_name: true,
    grant_number: true,
    funding_organization: true,
    funding_program: true,
    funding_amount: true,
    funding_currency: true,
    start_date: true,
    end_date: true,
    funding_url: true,
  },
  IndexContainer: {
    persons: true,
    organizations: true,
    facilities: true,
    projects: true,
    tools: true,
    services: true,
    publications: true,
    events: true,
    datasets: true,
    training_materials: true,
  },
  LangString: {
    language: true,
    value: true,
  },
  Organization: {
    name: true,
    organization_type: true,
    ror: true,
    description: true,
    homepage: true,
    location: true,
    address: true,
    contact_email: true,
    additional_urls: true,
    organization_structure: true,
    same_as: true,
  },
  OrganizationStructure: {
    parent_organization: true,
    start_date: true,
    end_date: true,
  },
  OrganizationProjectRole: {
    organization: true,
    org_project_role: true,
    start_date: true,
    end_date: true,
  },
  Person: {
    given_name: true,
    family_name: true,
    orcid: true,
    emails: true,
    homepage: true,
    description: true,
    affiliations: true,
    same_as: true,
  },
  Project: {
    name: true,
    description: true,
    start_date: true,
    end_date: true,
    digital_humanities_activities: true,
    research_disciplines: true,
    homepage: true,
    contact_email: true,
    additional_urls: true,
    studied_periods: true,
    studied_places: true,
    organization_roles: true,
    project_participations: true,
    funding_status: true,
    uses_datasets: true,
    uses_services: true,
    uses_tools: true,
    outputs_publications: true,
    outputs_datasets: true,
    outputs_tools: true,
    outputs_training_materials: true,
    funding: true,
    same_as: true,
  },
  ProjectParticipation: {
    participant: true,
    participation_role: true,
    start_date: true,
    end_date: true,
  },
  Publication: {
    name: true,
    publication_type: true,
    doi: true,
    description: true,
    homepage: true,
    date_issued: true,
    publisher: true,
    published_in: true,
    authorships: true,
    part_of: true,
    presented_at: true,
    same_as: true,
  },
  Relationship: {
    start_date: true,
    end_date: true,
  },
  ResourceContribution: {
    contributor: true,
    resource_contribution_role: true,
    start_date: true,
    end_date: true,
  },
  Service: {
    name: true,
    service_type: true,
    description: true,
    homepage: true,
    documentation_url: true,
    digital_humanities_activities: true,
    contact_email: true,
    provider: true,
    additional_urls: true,
    same_as: true,
  },
  Tool: {
    name: true,
    tool_type: true,
    doi: true,
    description: true,
    homepage: true,
    documentation_url: true,
    code_repository: true,
    programming_languages: true,
    license: true,
    additional_urls: true,
    digital_humanities_activities: true,
    contact_email: true,
    resource_contributions: true,
    same_as: true,
  },
  TrainingMaterial: {
    name: true,
    training_material_type: true,
    doi: true,
    description: true,
    digital_humanities_activities: true,
    date_issued: true,
    homepage: true,
    contact_email: true,
    creators: true,
    publisher: true,
    educational_level: true,
    target_audiences: true,
    prerequisites: true,
    learning_outcomes: true,
    in_languages: true,
    media_type: true,
    license: true,
    material_url: true,
    part_of_training_material: true,
    additional_urls: true,
    related_tools: true,
    related_services: true,
    related_datasets: true,
    same_as: true,
  },
} satisfies EntityFieldOrderDefinitions

const FIELD_ORDERS_BY_CLASS: Record<
  string,
  Readonly<Record<string, number>> | undefined
> = Object.fromEntries(
  Object.entries(ENTITY_FIELD_ORDER).map(([entityClass, fields]) => [
    entityClass,
    Object.fromEntries(
      Object.keys(fields).map((field, index) => [field, index]),
    ),
  ]),
)

export function getEntityClassFieldOrder(
  entityClass: string,
): Readonly<Record<string, number | undefined>> {
  return FIELD_ORDERS_BY_CLASS[entityClass] ?? {}
}

export function getEntityFieldOrder(
  type: EntityType,
): Readonly<Record<string, number | undefined>> {
  return getEntityClassFieldOrder(ENTITY_TYPE_METADATA[type].className)
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

export function normalizeEntityType(type: string): EntityType | undefined {
  const candidate = type.startsWith('idhi:') ? type : `idhi:${type}`
  return ENTITY_TYPES.find((entityType) => entityType === candidate)
}

export function getEntityTypeLabel(type: string): string {
  const labels: Record<string, string> = i18n.t('entity.types', {
    returnObjects: true,
  })
  return labels[normalizeEntityType(type) ?? type] ?? type
}

export function getEntityTypePluralLabel(type: string): string {
  const labels: Record<string, string> = i18n.t('entity.typesPlural', {
    returnObjects: true,
  })
  return labels[normalizeEntityType(type) ?? type] ?? getEntityTypeLabel(type)
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

export function getEnumValueLabel(field: string, value: string): string {
  const enumName =
    field
      .split('.')
      .pop()
      ?.replace(/\[\d+\]$/, '') ?? field
  const enums: Record<string, Record<string, string> | undefined> = i18n.t(
    'entity.enums',
    { returnObjects: true },
  )
  return enums[enumName]?.[value] ?? value
}

export type EntityClassName =
  (typeof ENTITY_TYPE_METADATA)[EntityType]['className']

export function getEntityClassName(type: EntityType): EntityClassName {
  return ENTITY_TYPE_METADATA[type].className
}

export function getEntityIdSegment(type: EntityType): string {
  return ENTITY_TYPE_METADATA[type].idSegment
}

export function getEntityTypeFromId(id: string): EntityType | undefined {
  return ENTITY_TYPES.find((type) =>
    id.startsWith(`idhi:${ENTITY_TYPE_METADATA[type].idSegment}:`),
  )
}

export function auditedEntityId(entity: AuditedEntity): string {
  return entity.id
}
