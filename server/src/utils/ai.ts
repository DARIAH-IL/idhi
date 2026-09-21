import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import type { RequestLogger } from '../middleware/logger'
import { ErrorCode } from '../models/errorCode'

const DEFAULT_AI_MODEL = '@cf/openai/gpt-oss-120b'
const MAX_OUTPUT_TOKENS = 4096

export function aiModel(bindings: Bindings): string {
  return bindings.AI_MODEL?.trim() || DEFAULT_AI_MODEL
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function finishReason(result: unknown): string | undefined {
  if (!isRecord(result) || !Array.isArray(result.choices)) {
    return undefined
  }

  const choice = result.choices.find(isRecord)

  return typeof choice?.finish_reason === 'string'
    ? choice.finish_reason
    : undefined
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

export async function runAiPrompt(
  bindings: Bindings,
  logger: RequestLogger,
  prompt: string,
  logAttributes: Record<string, unknown> = {},
): Promise<string> {
  const model = aiModel(bindings)
  const startedAt = Date.now()
  const result = await bindings.AI.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: MAX_OUTPUT_TOKENS,
  })
  const reason = finishReason(result)

  logger.debug('AI prompt completed', {
    ...logAttributes,
    model,
    promptCharacters: prompt.length,
    durationMs: Date.now() - startedAt,
    finishReason: reason,
    ...usageAttributes(result),
  })

  if (reason === 'length') {
    logger.warn('AI response was truncated by the output token limit', {
      ...logAttributes,
      model,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    })

    throw new ApiError(
      ErrorCode.AiSuggestionFailed,
      'The model ran out of output tokens before completing its answer',
    )
  }

  return extractResponseText(result)
}
