import type { Entity } from '#/api/models/entity.ts'
import type { FieldPaths } from '#/lib/fieldPaths.ts'
import { ENTITY_TYPES } from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'
import type en from '#/i18n/locales/en.json'

type EntityOf<TType extends EntityType> = Extract<Entity, { type: TType }>
type RelationshipLabel = keyof (typeof en)['entity']['relationships']['labels']

interface EntityRelationshipDefinition<TType extends EntityType> {
  path: FieldPaths<EntityOf<TType>>
  targetTypes: readonly [EntityType, ...EntityType[]]
  label: RelationshipLabel
}

type EntityRelationshipRegistry = {
  [TType in EntityType]: readonly EntityRelationshipDefinition<TType>[]
}

export interface IncomingEntityRelationship {
  key: string
  sourceType: EntityType
  path: FieldPaths<Entity>
  label: RelationshipLabel
}

const ENTITY_RELATIONSHIPS = {
  'idhi:Person': [
    {
      path: 'affiliations.organization',
      targetTypes: ['idhi:Organization'],
      label: 'people_affiliated_with_organization',
    },
  ],
  'idhi:Organization': [
    {
      path: 'organization_hierarchy.parent_organization',
      targetTypes: ['idhi:Organization'],
      label: 'organizations_within_organization',
    },
  ],
  'idhi:Facility': [
    {
      path: 'facility_affiliations.organization',
      targetTypes: ['idhi:Organization'],
      label: 'facilities_affiliated_with_organization',
    },
    {
      path: 'services_offered',
      targetTypes: ['idhi:Service'],
      label: 'facilities_offering_service',
    },
    {
      path: 'tools_provided',
      targetTypes: ['idhi:Tool'],
      label: 'facilities_providing_tool',
    },
  ],
  'idhi:Project': [
    {
      path: 'organization_roles.organization',
      targetTypes: ['idhi:Organization'],
      label: 'projects_involving_organization',
    },
    {
      path: 'project_participations.participant',
      targetTypes: ['idhi:Person'],
      label: 'projects_involving_person',
    },
    {
      path: 'funding.funding_organization',
      targetTypes: ['idhi:Organization'],
      label: 'projects_funded_by_organization',
    },
    {
      path: 'uses_datasets',
      targetTypes: ['idhi:Dataset'],
      label: 'projects_using_dataset',
    },
    {
      path: 'uses_services',
      targetTypes: ['idhi:Service'],
      label: 'projects_using_service',
    },
    {
      path: 'uses_tools',
      targetTypes: ['idhi:Tool'],
      label: 'projects_using_tool',
    },
    {
      path: 'outputs_publications',
      targetTypes: ['idhi:Publication'],
      label: 'projects_producing_publication',
    },
    {
      path: 'outputs_datasets',
      targetTypes: ['idhi:Dataset'],
      label: 'projects_producing_dataset',
    },
    {
      path: 'outputs_tools',
      targetTypes: ['idhi:Tool'],
      label: 'projects_producing_tool',
    },
    {
      path: 'outputs_training_materials',
      targetTypes: ['idhi:TrainingMaterial'],
      label: 'projects_producing_training_material',
    },
  ],
  'idhi:Tool': [
    {
      path: 'resource_contributions.contributor',
      targetTypes: ['idhi:Person', 'idhi:Organization'],
      label: 'tools_with_contributor',
    },
  ],
  'idhi:Service': [
    {
      path: 'provider',
      targetTypes: ['idhi:Organization'],
      label: 'services_provided_by_organization',
    },
  ],
  'idhi:Publication': [
    {
      path: 'authorships.author',
      targetTypes: ['idhi:Person'],
      label: 'publications_authored_by_person',
    },
    {
      path: 'publisher',
      targetTypes: ['idhi:Organization'],
      label: 'publications_published_by_organization',
    },
    {
      path: 'part_of',
      targetTypes: ['idhi:Publication'],
      label: 'publications_within_publication',
    },
    {
      path: 'presented_at',
      targetTypes: ['idhi:Event'],
      label: 'publications_presented_at_event',
    },
  ],
  'idhi:Event': [
    {
      path: 'event_agent_roles.event_agent',
      targetTypes: ['idhi:Person', 'idhi:Organization'],
      label: 'events_involving_agent',
    },
  ],
  'idhi:Dataset': [
    {
      path: 'publisher',
      targetTypes: ['idhi:Organization'],
      label: 'datasets_published_by_organization',
    },
    {
      path: 'datasets',
      targetTypes: ['idhi:Dataset'],
      label: 'datasets_containing_dataset',
    },
    {
      path: 'derived_from',
      targetTypes: ['idhi:Dataset'],
      label: 'datasets_derived_from_dataset',
    },
    {
      path: 'related_publications',
      targetTypes: ['idhi:Publication'],
      label: 'datasets_related_to_publication',
    },
    {
      path: 'resource_contributions.contributor',
      targetTypes: ['idhi:Person', 'idhi:Organization'],
      label: 'datasets_with_contributor',
    },
  ],
  'idhi:TrainingMaterial': [
    {
      path: 'creators',
      targetTypes: ['idhi:Person', 'idhi:Organization'],
      label: 'training_materials_created_by_agent',
    },
    {
      path: 'publisher',
      targetTypes: ['idhi:Organization'],
      label: 'training_materials_published_by_organization',
    },
    {
      path: 'part_of_training_material',
      targetTypes: ['idhi:TrainingMaterial'],
      label: 'training_materials_within_training_material',
    },
    {
      path: 'related_tools',
      targetTypes: ['idhi:Tool'],
      label: 'training_materials_related_to_tool',
    },
    {
      path: 'related_services',
      targetTypes: ['idhi:Service'],
      label: 'training_materials_related_to_service',
    },
    {
      path: 'related_datasets',
      targetTypes: ['idhi:Dataset'],
      label: 'training_materials_related_to_dataset',
    },
  ],
} as const satisfies EntityRelationshipRegistry

export function getIncomingEntityRelationships(
  targetType: EntityType,
): IncomingEntityRelationship[] {
  return ENTITY_TYPES.flatMap((sourceType) =>
    ENTITY_RELATIONSHIPS[sourceType]
      .filter(({ targetTypes }) =>
        targetTypes.some((candidate) => candidate === targetType),
      )
      .map(({ path, label }) => ({
        key: `${sourceType}:${path}`,
        sourceType,
        path,
        label,
      })),
  )
}
