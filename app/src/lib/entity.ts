import type { AuditedEntity, Entity } from '@/api/models'
import {
  PersonType,
  OrganizationType,
  FacilityType,
  ProjectType,
  ToolType,
  ServiceType,
  PublicationType,
  EventType,
  DatasetType,
  TrainingMaterialType,
} from '@/api/models'

export const ENTITY_TYPES = [
  PersonType['idhi:Person'],
  OrganizationType['idhi:Organization'],
  FacilityType['idhi:Facility'],
  ProjectType['idhi:Project'],
  ToolType['idhi:Tool'],
  ServiceType['idhi:Service'],
  PublicationType['idhi:Publication'],
  EventType['idhi:Event'],
  DatasetType['idhi:Dataset'],
  TrainingMaterialType['idhi:TrainingMaterial'],
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]

type LangString = { language: string; value: string }

function pickLang(
  items: LangString[] | null | undefined,
  preferred: string = 'en',
  fallback: string = 'he',
): string | undefined {
  if (!items?.length) return undefined
  return (
    items.find((i) => i.language === preferred)?.value ??
    items.find((i) => i.language === fallback)?.value ??
    items[0]?.value
  )
}

export function getEntityDisplayName(entity: Entity): string {
  const e = entity as unknown as Record<string, unknown>
  if (entity.type === 'idhi:Person') {
    const parts = [e['given_name'], e['family_name']].filter(Boolean)
    if (parts.length) return parts.join(' ')
    return entity.id
  }
  const rawName = e['name']
  const name =
    typeof rawName === 'string'
      ? rawName
      : pickLang(rawName as LangString[] | undefined)
  return name ?? entity.id
}

export function getEntityDescription(entity: Entity): string | undefined {
  const e = entity as unknown as Record<string, unknown>
  return pickLang(e['description'] as LangString[] | undefined)
}

export function getEntityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    [PersonType['idhi:Person']]: 'Person',
    [OrganizationType['idhi:Organization']]: 'Organization',
    [FacilityType['idhi:Facility']]: 'Facility',
    [ProjectType['idhi:Project']]: 'Project',
    [ToolType['idhi:Tool']]: 'Tool',
    [ServiceType['idhi:Service']]: 'Service',
    [PublicationType['idhi:Publication']]: 'Publication',
    [EventType['idhi:Event']]: 'Event',
    [DatasetType['idhi:Dataset']]: 'Dataset',
    [TrainingMaterialType['idhi:TrainingMaterial']]: 'Training material',
  }
  return labels[type] ?? type
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const ID_SEGMENT_TO_TYPE: Record<string, EntityType> = {
  person: PersonType['idhi:Person'],
  organization: OrganizationType['idhi:Organization'],
  facility: FacilityType['idhi:Facility'],
  project: ProjectType['idhi:Project'],
  tool: ToolType['idhi:Tool'],
  service: ServiceType['idhi:Service'],
  publication: PublicationType['idhi:Publication'],
  event: EventType['idhi:Event'],
  dataset: DatasetType['idhi:Dataset'],
  training_material: TrainingMaterialType['idhi:TrainingMaterial'],
}

const TYPE_TO_ID_SEGMENT = Object.fromEntries(
  Object.entries(ID_SEGMENT_TO_TYPE).map(([segment, type]) => [type, segment]),
) as Record<EntityType, string>

export function getEntityIdSegment(type: EntityType): string {
  return TYPE_TO_ID_SEGMENT[type]
}

export function getEntityTypeFromId(id: string): EntityType {
  const match = /^idhi:([^:]+):/.exec(id)
  if (!match) return PersonType['idhi:Person']
  return ID_SEGMENT_TO_TYPE[match[1]!] ?? PersonType['idhi:Person']
}

export function auditedEntityId(entity: AuditedEntity): string {
  return (entity as unknown as Record<string, string>)['id'] ?? ''
}
