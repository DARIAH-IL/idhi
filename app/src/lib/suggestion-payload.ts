const OMITTED_SUGGESTION_FIELDS = [
  'id',
  'image',
  'affiliations',
  'authorships',
  'creators',
  'datasets',
  'derived_from',
  'event_agent_roles',
  'funding',
  'organization_roles',
  'organization_structure',
  'outputs_datasets',
  'outputs_publications',
  'outputs_tools',
  'outputs_training_materials',
  'part_of',
  'part_of_training_material',
  'presented_at',
  'project_participations',
  'provider',
  'publisher',
  'related_datasets',
  'related_publications',
  'related_services',
  'related_tools',
  'resource_contributions',
  'services_offered',
  'tools_provided',
  'uses_datasets',
  'uses_services',
  'uses_tools',
]

export function toSuggestionEntity<T extends object>(entity: T): T {
  const pruned = { ...entity }

  for (const field of OMITTED_SUGGESTION_FIELDS) {
    Reflect.deleteProperty(pruned, field)
  }

  for (const [field, value] of Object.entries(pruned)) {
    if (!Array.isArray(value)) {
      continue
    }

    const kept = value.filter((item) => !isBlankLangString(item))

    if (kept.length === value.length) {
      continue
    }

    if (kept.length === 0) {
      Reflect.deleteProperty(pruned, field)
    } else {
      Reflect.set(pruned, field, kept)
    }
  }

  return pruned
}

export function hasSuggestionContext(entity: object): boolean {
  const values = new Map<string, unknown>(Object.entries(entity))
  const hasName = ['name', 'given_name', 'family_name'].some((field) =>
    hasLocalizedText(values.get(field)),
  )

  return hasName && hasLocalizedText(values.get('description'))
}

function isBlankLangString(item: unknown): boolean {
  return (
    typeof item === 'object' &&
    item !== null &&
    'language' in item &&
    !hasNonEmptyValue(item)
  )
}

function hasNonEmptyValue(item: object): boolean {
  return (
    'value' in item &&
    typeof item.value === 'string' &&
    item.value.trim().length > 0
  )
}

function hasLocalizedText(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (item) =>
        typeof item === 'object' && item !== null && hasNonEmptyValue(item),
    )
  )
}
