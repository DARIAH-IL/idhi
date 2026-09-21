import {
  DatasetDatasetType,
  EventEventAgentRolesItemEventAgentRole,
  EventEventType,
  FilterOperator,
  OrganizationOrganizationStructureItemOrganizationStructureRole,
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

/**
 * A "container" field is one that has at least one deeper dotted path under
 * it (e.g. `affiliations` because `affiliations.organization` exists, or
 * `description` because `description.value` exists). Containers hold complex
 * objects, not a directly comparable value, so they can never be search
 * fields themselves — only their leaves can. This is computed purely from
 * `EntityField`, so it never goes stale as the schema changes.
 */
type ContainerOf<TField> = TField extends string
  ? Extract<EntityField, `${TField}.${string}`> extends never
    ? never
    : TField
  : never
type ContainerField = ContainerOf<EntityField>

/** The raw `.language` half of every multilingual `{ language, value }` pair. */
type LanguageLeafField = Extract<EntityField, `${string}.language`>

/**
 * Every remaining field is a real, filterable leaf and MUST be given a kind
 * below (or added here with a reason) — `ADVANCED_SEARCH_FIELDS` is checked
 * against this exact set, not a partial one, so a new or renamed schema
 * field that isn't accounted for is a compile error, not a silent gap.
 */
type ExcludedField =
  | ContainerField
  | LanguageLeafField
  // A base64-encoded image blob: nothing sensible to filter on.
  | 'image'

type RequiredAdvancedSearchField = Exclude<EntityField, ExcludedField>

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
  'organization_structure.organization_structure_role': enumSpec(
    OrganizationOrganizationStructureItemOrganizationStructureRole,
  ),
  'organization_structure.start_date': { kind: 'date' },
  'organization_structure.end_date': { kind: 'date' },
  ror: { kind: 'string' },

  services_offered: { kind: 'string' },
  tools_provided: { kind: 'string' },

  digital_humanities_activities: enumSpecFromI18n(
    'digital_humanities_activities',
  ),
  'funding.funding_organization': { kind: 'string' },
  'funding.grant_name.value': { kind: 'string' },
  'funding.funding_program.value': { kind: 'string' },
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
  serves_datasets: { kind: 'string' },
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
} as const satisfies Record<
  RequiredAdvancedSearchField,
  AdvancedSearchFieldSpec
>

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

/**
 * Finds which i18n `entity.fields.<Class>` group defines a given field name,
 * so we never have to hand-maintain a field-to-class mapping: any class that
 * already has a translated label for that field name is picked up automatically.
 */
function findFieldOwnerClass(fieldName: string): string | undefined {
  const allFields: Record<string, Record<string, unknown> | undefined> = i18n.t(
    'entity.fields',
    { returnObjects: true },
  )
  return Object.keys(allFields).find(
    (className) => allFields[className]?.[fieldName] !== undefined,
  )
}

function resolveFieldLabel(fieldName: string): string {
  const ownerClass = findFieldOwnerClass(fieldName)
  return ownerClass
    ? getEntityFieldLabelText(ownerClass, fieldName)
    : fieldName.replaceAll('_', ' ')
}

type AuditField = Extract<AdvancedSearchField, `audit.${string}`>

const AUDIT_FIELD_LABELS: Record<AuditField, () => string> = {
  'audit.createdAt': () => String(i18n.t('entity.detail.created')),
  'audit.modifiedAt': () => String(i18n.t('entity.detail.modified')),
  'audit.createdBy': () =>
    `${i18n.t('entity.detail.created')} ${i18n.t('entity.detail.by')}`,
  'audit.modifiedBy': () =>
    `${i18n.t('entity.detail.modified')} ${i18n.t('entity.detail.by')}`,
}

function isAuditField(field: AdvancedSearchField): field is AuditField {
  return field in AUDIT_FIELD_LABELS
}

export function getAdvancedSearchFieldLabel(
  field: AdvancedSearchField,
): string {
  if (field === 'isDraft') {
    return String(i18n.t('entity.draft_badge'))
  }

  if (isAuditField(field)) {
    return AUDIT_FIELD_LABELS[field]()
  }

  const [base, sub] = field.split('.')
  const baseName = base ?? field
  const baseLabel = resolveFieldLabel(baseName)

  if (!sub || sub === 'value' || sub === 'language') {
    return baseLabel
  }

  return `${baseLabel}: ${resolveFieldLabel(sub)}`
}
