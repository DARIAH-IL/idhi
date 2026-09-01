import {
  DatasetDatasetType,
  EventEventAgentRolesItemEventAgentRole,
  EventEventType,
  FacilityFacilityAffiliationsItemFacilityAffiliationRole,
  FilterOperator,
  OrganizationOrganizationType,
  PersonAffiliationsItemAffiliationRole,
  ProjectFundingItemFundingCurrency,
  ProjectFundingStatus,
  ProjectOrganizationRolesItemOrgProjectRole,
  ProjectProjectParticipationsItemParticipationRole,
  PublicationAuthorshipsItemAuthorshipRole,
  ServiceServiceType,
  ToolLicense,
  ToolResourceContributionsItemResourceContributionRole,
  ToolToolType,
  TrainingMaterialTrainingMaterialType,
} from '#/api/models'
import type { EntityField } from '#/api/typedEntitySearch.ts'
import {
  ENTITY_TYPES,
  getEntityFieldLabelText,
  getEntityTypeLabel,
  getEnumValueLabel,
} from '#/lib/entity.ts'
import i18n from '#/i18n'

const FILTER_OPERATOR_VALUES: ReadonlySet<string> = new Set(
  Object.values(FilterOperator),
)

export function isFilterOperator(value: string): value is FilterOperator {
  return FILTER_OPERATOR_VALUES.has(value)
}

export type AdvancedSearchFieldKind =
  'string' | 'number' | 'boolean' | 'date' | 'enum'

export const FIELD_KIND_OPERATORS = {
  string: ['eq', 'ne', 'in', 'nin', 'exists'],
  number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'exists'],
  boolean: ['eq', 'ne', 'exists'],
  date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'exists'],
  enum: ['eq', 'ne', 'in', 'nin', 'exists'],
} as const satisfies Record<AdvancedSearchFieldKind, readonly FilterOperator[]>

interface AdvancedSearchFieldSpec {
  kind: AdvancedSearchFieldKind
  values?: readonly string[]
}

function enumSpec(values: Record<string, string>): AdvancedSearchFieldSpec {
  return { kind: 'enum', values: Object.values(values) }
}

function enumSpecFromI18n(enumName: string): AdvancedSearchFieldSpec {
  const enums: Record<string, Record<string, string> | undefined> = i18n.t(
    'entity.enums',
    { returnObjects: true },
  )
  return { kind: 'enum', values: Object.keys(enums[enumName] ?? {}) }
}

export const ADVANCED_SEARCH_FIELDS = {
  type: { kind: 'enum', values: ENTITY_TYPES },
  tags: { kind: 'string' },
  id: { kind: 'string' },
  isDraft: { kind: 'boolean' },
  'audit.createdAt': { kind: 'date' },
  'audit.modifiedAt': { kind: 'date' },
  'audit.createdBy': { kind: 'string' },
  'audit.modifiedBy': { kind: 'string' },

  'name.value': { kind: 'string' },
  'description.value': { kind: 'string' },
  homepage: { kind: 'string' },
  same_as: { kind: 'string' },
  additional_urls: { kind: 'string' },
  contact_email: { kind: 'string' },
  start_date: { kind: 'date' },
  end_date: { kind: 'date' },

  'affiliations.organization': { kind: 'string' },
  'affiliations.affiliation_role': enumSpec(
    PersonAffiliationsItemAffiliationRole,
  ),
  'affiliations.start_date': { kind: 'date' },
  'affiliations.end_date': { kind: 'date' },
  emails: { kind: 'string' },
  'family_name.value': { kind: 'string' },
  'given_name.value': { kind: 'string' },
  orcid: { kind: 'string' },

  'address.value': { kind: 'string' },
  'location.value': { kind: 'string' },
  organization_type: enumSpec(OrganizationOrganizationType),
  'organization_structure.parent_organization': { kind: 'string' },
  'organization_structure.start_date': { kind: 'date' },
  'organization_structure.end_date': { kind: 'date' },
  ror: { kind: 'string' },

  'facility_affiliations.organization': { kind: 'string' },
  'facility_affiliations.facility_affiliation_role': enumSpec(
    FacilityFacilityAffiliationsItemFacilityAffiliationRole,
  ),
  'facility_affiliations.start_date': { kind: 'date' },
  'facility_affiliations.end_date': { kind: 'date' },
  services_offered: { kind: 'string' },
  tools_provided: { kind: 'string' },

  digital_humanities_activities: enumSpecFromI18n(
    'digital_humanities_activities',
  ),
  'funding.funding_organization': { kind: 'string' },
  'funding.grant_name.value': { kind: 'string' },
  'funding.grant_number': { kind: 'string' },
  'funding.funding_amount': { kind: 'number' },
  'funding.funding_currency': enumSpec(ProjectFundingItemFundingCurrency),
  'funding.funding_url': { kind: 'string' },
  'funding.start_date': { kind: 'date' },
  'funding.end_date': { kind: 'date' },
  funding_status: enumSpec(ProjectFundingStatus),
  'organization_roles.organization': { kind: 'string' },
  'organization_roles.org_project_role': enumSpec(
    ProjectOrganizationRolesItemOrgProjectRole,
  ),
  'organization_roles.start_date': { kind: 'date' },
  'organization_roles.end_date': { kind: 'date' },
  outputs_datasets: { kind: 'string' },
  outputs_publications: { kind: 'string' },
  outputs_tools: { kind: 'string' },
  outputs_training_materials: { kind: 'string' },
  'project_participations.participant': { kind: 'string' },
  'project_participations.participation_role': enumSpec(
    ProjectProjectParticipationsItemParticipationRole,
  ),
  'project_participations.start_date': { kind: 'date' },
  'project_participations.end_date': { kind: 'date' },
  'research_disciplines.value': { kind: 'string' },
  'studied_periods.value': { kind: 'string' },
  'studied_places.value': { kind: 'string' },
  uses_datasets: { kind: 'string' },
  uses_services: { kind: 'string' },
  uses_tools: { kind: 'string' },

  code_repository: { kind: 'string' },
  documentation_url: { kind: 'string' },
  doi: { kind: 'string' },
  license: enumSpec(ToolLicense),
  programming_languages: { kind: 'string' },
  'resource_contributions.contributor': { kind: 'string' },
  'resource_contributions.resource_contribution_role': enumSpec(
    ToolResourceContributionsItemResourceContributionRole,
  ),
  'resource_contributions.start_date': { kind: 'date' },
  'resource_contributions.end_date': { kind: 'date' },
  tool_type: enumSpec(ToolToolType),

  provider: { kind: 'string' },
  service_type: enumSpec(ServiceServiceType),

  'authorships.author': { kind: 'string' },
  'authorships.author_order': { kind: 'number' },
  'authorships.authorship_role': enumSpec(
    PublicationAuthorshipsItemAuthorshipRole,
  ),
  'authorships.start_date': { kind: 'date' },
  'authorships.end_date': { kind: 'date' },
  date_issued: { kind: 'date' },
  part_of: { kind: 'string' },
  presented_at: { kind: 'string' },
  publication_type: enumSpecFromI18n('publication_type'),
  'published_in.value': { kind: 'string' },
  publisher: { kind: 'string' },

  'event_agent_roles.event_agent': { kind: 'string' },
  'event_agent_roles.event_agent_role': enumSpec(
    EventEventAgentRolesItemEventAgentRole,
  ),
  'event_agent_roles.start_date': { kind: 'date' },
  'event_agent_roles.end_date': { kind: 'date' },
  event_type: enumSpec(EventEventType),

  byte_size: { kind: 'number' },
  dataset_type: enumSpec(DatasetDatasetType),
  datasets: { kind: 'string' },
  derived_from: { kind: 'string' },
  distribution_url: { kind: 'string' },
  extent: { kind: 'string' },
  in_languages: { kind: 'string' },
  media_type: { kind: 'string' },
  related_publications: { kind: 'string' },
  'themes.value': { kind: 'string' },

  creators: { kind: 'string' },
  'educational_level.value': { kind: 'string' },
  'learning_outcomes.value': { kind: 'string' },
  material_url: { kind: 'string' },
  part_of_training_material: { kind: 'string' },
  'prerequisites.value': { kind: 'string' },
  related_datasets: { kind: 'string' },
  related_services: { kind: 'string' },
  related_tools: { kind: 'string' },
  'target_audiences.value': { kind: 'string' },
  training_material_type: enumSpec(TrainingMaterialTrainingMaterialType),
} as const satisfies Partial<Record<EntityField, AdvancedSearchFieldSpec>>

export type AdvancedSearchField = keyof typeof ADVANCED_SEARCH_FIELDS

export function isAdvancedSearchField(
  field: string,
): field is AdvancedSearchField {
  return field in ADVANCED_SEARCH_FIELDS
}

export const ADVANCED_SEARCH_FIELD_KEYS = Object.keys(
  ADVANCED_SEARCH_FIELDS,
).filter(isAdvancedSearchField)

export function isAdminOnlyField(field: AdvancedSearchField): boolean {
  return field.startsWith('audit.')
}

export function getVisibleAdvancedSearchFieldKeys(
  isAdmin: boolean,
): AdvancedSearchField[] {
  return isAdmin
    ? ADVANCED_SEARCH_FIELD_KEYS
    : ADVANCED_SEARCH_FIELD_KEYS.filter((field) => !isAdminOnlyField(field))
}

export function getFieldKind(
  field: AdvancedSearchField,
): AdvancedSearchFieldKind {
  return ADVANCED_SEARCH_FIELDS[field].kind
}

export function getFieldOperators(
  field: AdvancedSearchField,
): readonly FilterOperator[] {
  return FIELD_KIND_OPERATORS[getFieldKind(field)]
}

export function getFieldEnumValues(
  field: AdvancedSearchField,
): readonly string[] | undefined {
  const spec: AdvancedSearchFieldSpec = ADVANCED_SEARCH_FIELDS[field]
  return spec.values
}

export function operatorTakesListValue(operator: FilterOperator): boolean {
  return operator === 'in' || operator === 'nin'
}

export function getAdvancedSearchEnumValueLabel(
  field: AdvancedSearchField,
  value: string,
): string {
  return field === 'type'
    ? getEntityTypeLabel(value)
    : getEnumValueLabel(field, value)
}

interface FieldLabelSource {
  ownerClass: string
  nestedClass?: string
}

const FIELD_LABEL_SOURCES: Record<string, FieldLabelSource> = {
  type: { ownerClass: 'Person' },
  tags: { ownerClass: 'Person' },
  id: { ownerClass: 'Person' },
  name: { ownerClass: 'Organization' },
  description: { ownerClass: 'Person' },
  homepage: { ownerClass: 'Person' },
  same_as: { ownerClass: 'Person' },
  additional_urls: { ownerClass: 'Organization' },
  contact_email: { ownerClass: 'Organization' },
  start_date: { ownerClass: 'Project' },
  end_date: { ownerClass: 'Project' },

  affiliations: { ownerClass: 'Person', nestedClass: 'Affiliation' },
  emails: { ownerClass: 'Person' },
  family_name: { ownerClass: 'Person' },
  given_name: { ownerClass: 'Person' },
  orcid: { ownerClass: 'Person' },

  address: { ownerClass: 'Organization' },
  location: { ownerClass: 'Organization' },
  organization_type: { ownerClass: 'Organization' },
  organization_structure: {
    ownerClass: 'Organization',
    nestedClass: 'OrganizationStructure',
  },
  ror: { ownerClass: 'Organization' },

  facility_affiliations: {
    ownerClass: 'Facility',
    nestedClass: 'FacilityAffiliation',
  },
  services_offered: { ownerClass: 'Facility' },
  tools_provided: { ownerClass: 'Facility' },

  digital_humanities_activities: { ownerClass: 'Project' },
  funding: { ownerClass: 'Project', nestedClass: 'Funding' },
  funding_status: { ownerClass: 'Project' },
  organization_roles: {
    ownerClass: 'Project',
    nestedClass: 'OrganizationProjectRole',
  },
  outputs_datasets: { ownerClass: 'Project' },
  outputs_publications: { ownerClass: 'Project' },
  outputs_tools: { ownerClass: 'Project' },
  outputs_training_materials: { ownerClass: 'Project' },
  project_participations: {
    ownerClass: 'Project',
    nestedClass: 'ProjectParticipation',
  },
  research_disciplines: { ownerClass: 'Project' },
  studied_periods: { ownerClass: 'Project' },
  studied_places: { ownerClass: 'Project' },
  uses_datasets: { ownerClass: 'Project' },
  uses_services: { ownerClass: 'Project' },
  uses_tools: { ownerClass: 'Project' },

  code_repository: { ownerClass: 'Tool' },
  documentation_url: { ownerClass: 'Tool' },
  doi: { ownerClass: 'Tool' },
  license: { ownerClass: 'Tool' },
  programming_languages: { ownerClass: 'Tool' },
  resource_contributions: {
    ownerClass: 'Tool',
    nestedClass: 'ResourceContribution',
  },
  tool_type: { ownerClass: 'Tool' },

  provider: { ownerClass: 'Service' },
  service_type: { ownerClass: 'Service' },

  authorships: { ownerClass: 'Publication', nestedClass: 'Authorship' },
  date_issued: { ownerClass: 'Publication' },
  part_of: { ownerClass: 'Publication' },
  presented_at: { ownerClass: 'Publication' },
  publication_type: { ownerClass: 'Publication' },
  published_in: { ownerClass: 'Publication' },
  publisher: { ownerClass: 'Publication' },

  event_agent_roles: { ownerClass: 'Event', nestedClass: 'EventAgentRole' },
  event_type: { ownerClass: 'Event' },

  byte_size: { ownerClass: 'Dataset' },
  dataset_type: { ownerClass: 'Dataset' },
  datasets: { ownerClass: 'Dataset' },
  derived_from: { ownerClass: 'Dataset' },
  distribution_url: { ownerClass: 'Dataset' },
  extent: { ownerClass: 'Dataset' },
  in_languages: { ownerClass: 'Dataset' },
  media_type: { ownerClass: 'Dataset' },
  related_publications: { ownerClass: 'Dataset' },
  themes: { ownerClass: 'Dataset' },

  creators: { ownerClass: 'TrainingMaterial' },
  educational_level: { ownerClass: 'TrainingMaterial' },
  learning_outcomes: { ownerClass: 'TrainingMaterial' },
  material_url: { ownerClass: 'TrainingMaterial' },
  part_of_training_material: { ownerClass: 'TrainingMaterial' },
  prerequisites: { ownerClass: 'TrainingMaterial' },
  related_datasets: { ownerClass: 'TrainingMaterial' },
  related_services: { ownerClass: 'TrainingMaterial' },
  related_tools: { ownerClass: 'TrainingMaterial' },
  target_audiences: { ownerClass: 'TrainingMaterial' },
  training_material_type: { ownerClass: 'TrainingMaterial' },
}

function getAuditFieldLabel(field: AdvancedSearchField): string | undefined {
  switch (field) {
    case 'audit.createdAt':
      return String(i18n.t('entity.detail.created'))
    case 'audit.modifiedAt':
      return String(i18n.t('entity.detail.modified'))
    case 'audit.createdBy':
      return `${i18n.t('entity.detail.created')} ${i18n.t('entity.detail.by')}`
    case 'audit.modifiedBy':
      return `${i18n.t('entity.detail.modified')} ${i18n.t('entity.detail.by')}`
    default:
      return undefined
  }
}

export function getAdvancedSearchFieldLabel(
  field: AdvancedSearchField,
): string {
  if (field === 'isDraft') {
    return String(i18n.t('entity.draft_badge'))
  }

  const auditLabel = getAuditFieldLabel(field)
  if (auditLabel) {
    return auditLabel
  }

  const [base, sub] = field.split('.')
  const baseName = base ?? field
  const source = FIELD_LABEL_SOURCES[baseName]
  const baseLabel = source
    ? getEntityFieldLabelText(source.ownerClass, baseName)
    : baseName.replaceAll('_', ' ')

  if (!sub || sub === 'value' || sub === 'language') {
    return baseLabel
  }

  const nestedLabel = source?.nestedClass
    ? getEntityFieldLabelText(source.nestedClass, sub)
    : sub.replaceAll('_', ' ')

  return `${baseLabel}: ${nestedLabel}`
}
