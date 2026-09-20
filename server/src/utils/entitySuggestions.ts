import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import type { RequestLogger } from '../middleware/logger'
import { ProjectDigitalHumanitiesActivitiesItem } from '../models/projectDigitalHumanitiesActivitiesItem'
import { ErrorCode } from '../models/errorCode'
import { SuggestibleEntityField } from '../models/suggestibleEntityField'

const DEFAULT_AI_MODEL = '@cf/openai/gpt-oss-120b'
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

const sharedPromptRules = `- Base every value only on what the record below actually states. Never invent, infer or guess anything that the record does not support.
- Prefer a short, confident answer over a comprehensive one. Two or three values is usually right, and one is often enough.
- Omit any value you are not confident about. Returning nothing is better than returning something unsupported.
- Do not repeat a value the record already lists.`

const outputInstruction = `Output the values as a single line of comma-separated values and nothing else. No explanation, no preamble, no bullet points, no quotes, no markdown. If you have no value to suggest, output an empty line.`

const fieldPrompts: Record<SuggestibleEntityField, string> = {
  [SuggestibleEntityField.tags]: `You assign free-text discovery tags to a record in IDHI, an index of Digital Humanities research.

Suggest tags for the record below.

${sharedPromptRules}
- Each tag is a short lowercase noun phrase of one to three words.
- Prefer wording that matches a concept in an established ontology or thesaurus, such as Wikidata, Getty AAT or TaDiRAH, so the tags can later be reconciled against it.
- Tag what the record is about: its subject matter, materials, methods and domain. Do not tag generic qualities that apply to every record, such as "digital", "research" or "project".

${outputInstruction}`,

  [SuggestibleEntityField.digital_humanities_activities]: `You classify a record in IDHI, an index of Digital Humanities research, by the TaDiRAH research activities it involves.

Choose the activities that the record below practises, or teaches if it is a training material.

${sharedPromptRules}
- Choose only from the allowed activities listed at the end of these instructions. Never output a value that is not on that list, and copy each value exactly as it is spelled there.
- Prefer the most specific allowed activity the record supports over a broad one.

${outputInstruction}

Allowed activities:
${tadirahActivities.map((activity) => activity.slice(TADIRAH_PREFIX.length)).join(', ')}`,
}

const describedFields = [
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
  'doi',
  'same_as',
]

type LangString = { language: string; value: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLangString(value: unknown): value is LangString {
  return (
    isRecord(value) &&
    typeof value.language === 'string' &&
    typeof value.value === 'string'
  )
}

function preferredLangStringValue(values: LangString[]): string | undefined {
  const preferred =
    values.find((item) => item.language.toLowerCase() === PREFERRED_LANGUAGE) ??
    values.find((item) =>
      item.language.toLowerCase().startsWith(`${PREFERRED_LANGUAGE}-`),
    ) ??
    values[0]

  return preferred?.value.trim() || undefined
}

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
    return preferredLangStringValue(value)
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

function responseItemText(item: unknown): string[] {
  if (!isRecord(item) || !Array.isArray(item.content)) {
    return []
  }

  return item.content.flatMap((part) =>
    isRecord(part) && typeof part.text === 'string' ? [part.text] : [],
  )
}

function extractResponseText(result: unknown): string {
  if (typeof result === 'string') {
    return result
  }

  if (!isRecord(result)) {
    return ''
  }

  if (typeof result.response === 'string') {
    return result.response
  }

  if (typeof result.output_text === 'string') {
    return result.output_text
  }

  if (Array.isArray(result.choices)) {
    const message = result.choices.find(isRecord)?.message

    if (isRecord(message) && typeof message.content === 'string') {
      return message.content
    }
  }

  if (Array.isArray(result.output)) {
    const messages = result.output.filter(
      (item) => isRecord(item) && item.type === 'message',
    )
    const items = messages.length > 0 ? messages : result.output

    return items.flatMap(responseItemText).join('\n')
  }

  return ''
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

function usageAttributes(result: unknown): Record<string, unknown> {
  if (!isRecord(result) || !isRecord(result.usage)) {
    return { inputTokens: undefined, outputTokens: undefined }
  }

  const { usage } = result

  return {
    inputTokens: usage.input_tokens ?? usage.prompt_tokens,
    outputTokens: usage.output_tokens ?? usage.completion_tokens,
    totalTokens: usage.total_tokens,
  }
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

  const prompt = `${fieldPrompts[field]}\n\n${entityDescription}`
  const model = bindings.AI_MODEL?.trim() || DEFAULT_AI_MODEL
  const startedAt = Date.now()
  const result = await bindings.AI.run(model, {
    messages: [{ role: 'user', content: prompt }],
  })

  logger.debug('AI suggestion completed', {
    model,
    field,
    promptCharacters: prompt.length,
    durationMs: Date.now() - startedAt,
    ...usageAttributes(result),
  })

  const values = parseCommaSeparatedValues(extractResponseText(result))

  if (!values) {
    logger.warn('AI suggestion response was not a comma-separated list', {
      model,
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
