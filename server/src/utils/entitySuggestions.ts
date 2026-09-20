import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import type { RequestLogger } from '../middleware/logger'
import type { Entity } from '../models'
import { ProjectDigitalHumanitiesActivitiesItem } from '../models/projectDigitalHumanitiesActivitiesItem'
import { ErrorCode } from '../models/errorCode'
import { SuggestibleEntityField } from '../models/suggestibleEntityField'
import { aiModel, runAiPrompt } from './ai'
import { extractUrls, inspectUrlTool } from './browser'
import { isLangString, preferredLangStringValue } from './langString'

type UnionKeys<T> = T extends unknown ? keyof T : never
type EntityFieldName = UnionKeys<Entity> & string

const MAX_SUGGESTIONS = 12
const MAX_SUGGESTION_LENGTH = 80
const MAX_SUGGESTION_WORDS = 4
const MAX_ENTITY_DESCRIPTION_LENGTH = 6000
const PREFERRED_LANGUAGE = 'en'
const TADIRAH_PREFIX = 'tadirah:'

const tadirahActivities = Object.values(ProjectDigitalHumanitiesActivitiesItem)

const tadirahActivitiesByName = new Map(
  tadirahActivities.map((activity) => [
    activity.slice(TADIRAH_PREFIX.length).toLowerCase(),
    activity,
  ]),
)

const webInspectionRules = `Web-page inspection:
- The record may contain URLs.
- Base classifications primarily on evidence contained in the record.
- If the record does not provide enough information to confidently classify a value, and a relevant URL is present, you may inspect that URL using the inspect_url tool.
- Use inspect_url only when the additional information could materially improve the classification.
- Do not inspect URLs merely because they are present.
- Prefer inspecting a URL that is directly associated with the record or classification in question.
- Only inspect URLs that literally appear in the record. Never invent, complete, or modify a URL, and never follow unrelated links simply to gather more information.
- Treat information returned by inspect_url as additional evidence, not as a reason to invent unsupported conclusions.
- If the page does not provide relevant evidence, ignore it and continue using the available evidence.
- If the page cannot be accessed, continue without it.
- Never claim that a fact is supported by a webpage unless that fact actually appears in the retrieved page content.
- When the available evidence remains insufficient after optional inspection, omit the uncertain classification rather than guessing.`

const sharedPromptRules = `- Base every value only on what the record below actually supports. Never invent or guess anything that the record does not support.
- Prefer a short, confident answer over a comprehensive one. Two or three values is usually right, and one is often enough.
- Omit any value you are not confident about. Returning nothing is better than returning something unsupported.
- Do not repeat a value the record already lists.`

const outputInstruction = `Once you have finished gathering evidence, output the values as a single line of comma-separated values and nothing else. No explanation, no preamble, no bullet points, no quotes, no markdown. If you have no value to suggest, output an empty line.`

const fieldPrompts: Record<SuggestibleEntityField, string> = {
  [SuggestibleEntityField.tags]: `You assign free-text discovery tags to a record in an index of Digital Humanities research.

Suggest tags for the record below.

${sharedPromptRules}
- Tags are short, meaningful labels used to help users discover, search, filter, and group related records.
- Each tag is a short noun or noun phrase of one to three words.
- Use lowercase for ordinary nouns and noun phrases, but preserve the conventional capitalization of proper names and named entities.
- Tags may describe concepts, subjects, domains, materials, methods, technologies, genres, historical periods, places, people, works, collections, organizations, or other specific entities that are central to the record.
- Tags do not have to be abstract concepts: specific names and named entities are valid tags when they are relevant to the record.
- Prefer tags that are broadly reusable across multiple records. Use a tag when it could meaningfully describe other records in the index, rather than inventing a highly specific label that is unlikely to recur.
- Prefer clear, conventional wording that users are likely to search for or recognize. Avoid unnecessarily technical, obscure, poetic, or overly elaborate phrasing.
- Use the same natural term consistently rather than creating unnecessary synonyms or variants for the same concept.
- Tag the substantive topics and entities represented by the record, rather than merely repeating incidental words from its title or description.
- Do not tag generic qualities that apply to many or nearly all records, such as "digital", "research", or "project".
- Prefer specific, useful tags over broad or redundant ones. Each tag should add meaningful information about the record and contribute to its discoverability or grouping.

${outputInstruction}`,

  [SuggestibleEntityField.digital_humanities_activities]: `You classify a record in an index of Digital Humanities research according to the TaDiRAH research activities it involves.

TaDiRAH (Taxonomy of Digital Research Activities in the Humanities) is a controlled vocabulary for describing the research activities performed in Digital Humanities work, from data creation and collection through processing, analysis, interpretation, dissemination, and related activities.

Select the TaDiRAH activities that the record actually performs, describes as part of its research process, or teaches when the record is a training or instructional resource.

The activities should describe **what is done**, not simply what the record is about. Do not classify a subject, research topic, technology, dataset, output, or general characteristic as an activity unless the record indicates that it is actually used as part of a research activity.

${sharedPromptRules}
- Choose only from the allowed activities listed at the end of these instructions. Never output a value that is not on that list, and copy each value exactly as it is spelled there.
- Select an activity only when there is sufficient evidence in the record that the activity is performed, described as part of the research process, or taught by the resource.
- Prefer the most specific allowed activity supported by the record. Do not select a broader parent activity when a more specific allowed activity clearly applies.
- Do not infer activities solely from the presence of a tool, technology, dataset, discipline, topic, or research output. For example, mentioning a database does not by itself mean that the record performs a database-related activity.
- Do not select activities merely because they could plausibly be part of the research. Base the classification on what the record explicitly describes or clearly demonstrates.
- Select multiple activities when the record clearly involves multiple distinct research activities.
- Do not add activities simply to make the classification more comprehensive; precision is more important than coverage.

${outputInstruction}

Allowed activities:
${tadirahActivities.map((activity) => activity.slice(TADIRAH_PREFIX.length)).join(', ')}`,
}

const describedFields: EntityFieldName[] = [
  'type',
  'name',
  'given_name',
  'family_name',
  'description',
  'organization_type',
  'tool_type',
  'service_type',
  'event_type',
  'dataset_type',
  'publication_type',
  'training_material_type',
  'research_disciplines',
  'themes',
  'target_audiences',
  'educational_level',
  'learning_outcomes',
  'programming_languages',
  'in_languages',
  'tags',
  'digital_humanities_activities',
  'homepage',
  'additional_urls',
  'documentation_url',
  'code_repository',
  'distribution_url',
  'material_url',
  'same_as',
]

function renderFieldValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value.trim() || undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (!Array.isArray(value) || value.length === 0) {
    return undefined
  }

  if (value.every(isLangString)) {
    return preferredLangStringValue(value, PREFERRED_LANGUAGE)
  }

  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length > 0 ? items.join(', ') : undefined
}

export function describeEntity(entity: object): string {
  const values = new Map<string, unknown>(Object.entries(entity))
  const lines: string[] = []

  for (const field of describedFields) {
    const rendered = renderFieldValue(values.get(field))

    if (rendered) {
      lines.push(`${field.replace(/_/g, ' ')}: ${rendered}`)
    }
  }

  return lines.join('\n').slice(0, MAX_ENTITY_DESCRIPTION_LENGTH)
}

function parseCommaSeparatedValues(text: string): string[] | undefined {
  const fenced = text.match(/```(?:\w+)?\s*([\s\S]*?)```/)
  const [line, ...extraLines] = (fenced?.[1] ?? text)
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .filter(Boolean)

  if (line === undefined) {
    return []
  }

  if (extraLines.length > 0) {
    return undefined
  }

  const values = line
    .split(',')
    .map((value) =>
      value
        .trim()
        .replace(/^["']+|["']+$/g, '')
        .replace(/[.!?;]+$/, '')
        .trim(),
    )
    .filter(Boolean)

  const looksLikeProse = values.some(
    (value) =>
      value.length > MAX_SUGGESTION_LENGTH ||
      value.split(/\s+/).length > MAX_SUGGESTION_WORDS,
  )

  return looksLikeProse ? undefined : values
}

function deduplicate(values: string[]): string[] {
  const seen = new Set<string>()
  const suggestions: string[] = []

  for (const value of values) {
    const key = value.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    suggestions.push(value)

    if (suggestions.length >= MAX_SUGGESTIONS) {
      break
    }
  }

  return suggestions
}

function toTadirahActivities(values: string[]): string[] {
  return values.flatMap((value) => {
    const name = value.startsWith(TADIRAH_PREFIX)
      ? value.slice(TADIRAH_PREFIX.length)
      : value
    const activity = tadirahActivitiesByName.get(name.trim().toLowerCase())

    return activity ? [activity] : []
  })
}

export async function suggestEntityFieldValues(
  bindings: Bindings,
  logger: RequestLogger,
  entity: object,
  field: SuggestibleEntityField,
): Promise<string[]> {
  const entityDescription = describeEntity(entity)

  if (!entityDescription) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      'Entity carries no values to base suggestions on',
    )
  }

  const recordUrls = extractUrls(entityDescription)
  const tools =
    recordUrls.length > 0
      ? [inspectUrlTool(bindings, logger, recordUrls, { field })]
      : []
  const instructions =
    recordUrls.length > 0
      ? `${fieldPrompts[field]}\n\n${webInspectionRules}`
      : fieldPrompts[field]
  const prompt = `${instructions}\n\n${entityDescription}`
  const text = await runAiPrompt(bindings, logger, prompt, { field }, tools)
  const values = parseCommaSeparatedValues(text)

  if (!values) {
    logger.warn('AI suggestion response was not a comma-separated list', {
      model: aiModel(bindings),
      field,
    })

    throw new ApiError(
      ErrorCode.AiSuggestionFailed,
      'The suggestion model did not return a comma-separated list of values',
    )
  }

  if (field === SuggestibleEntityField.digital_humanities_activities) {
    return deduplicate(toTadirahActivities(values))
  }

  return deduplicate(values)
}
