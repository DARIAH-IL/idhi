import type { Bindings } from '../bindings'
import { ApiError } from '../errors/ApiError'
import type { RequestLogger } from '../middleware/logger'
import { ErrorCode } from '../models/errorCode'

const DEFAULT_AI_MODEL = '@cf/openai/gpt-oss-120b'
const MAX_OUTPUT_TOKENS = 4096
const MAX_MODEL_STEPS = 4

export type AiTool = {
  definition: ChatCompletionFunctionTool
  run: (args: Record<string, unknown>) => Promise<string>
}

type AiToolCall = {
  id: string
  name: string
  arguments: string
}

export function aiModel(bindings: Bindings): string {
  return bindings.AI_MODEL?.trim() || DEFAULT_AI_MODEL
}

export function isRecord(value: unknown): value is Record<string, unknown> {
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

function toolCallsFromChoices(result: Record<string, unknown>): AiToolCall[] {
  if (!Array.isArray(result.choices)) {
    return []
  }

  const message = result.choices.find(isRecord)?.message

  if (!isRecord(message) || !Array.isArray(message.tool_calls)) {
    return []
  }

  return message.tool_calls.flatMap((call) => {
    if (!isRecord(call) || !isRecord(call.function)) {
      return []
    }

    const { name } = call.function

    if (typeof name !== 'string') {
      return []
    }

    return [
      {
        id: typeof call.id === 'string' ? call.id : name,
        name,
        arguments:
          typeof call.function.arguments === 'string'
            ? call.function.arguments
            : '{}',
      },
    ]
  })
}

function toolCallsFromOutput(result: Record<string, unknown>): AiToolCall[] {
  if (!Array.isArray(result.output)) {
    return []
  }

  return result.output.flatMap((item) => {
    if (
      !isRecord(item) ||
      item.type !== 'function_call' ||
      typeof item.name !== 'string'
    ) {
      return []
    }

    const id = item.call_id ?? item.id

    return [
      {
        id: typeof id === 'string' ? id : item.name,
        name: item.name,
        arguments: typeof item.arguments === 'string' ? item.arguments : '{}',
      },
    ]
  })
}

function extractToolCalls(result: unknown): AiToolCall[] {
  if (!isRecord(result)) {
    return []
  }

  const calls = toolCallsFromChoices(result)

  return calls.length > 0 ? calls : toolCallsFromOutput(result)
}

function parseToolArguments(args: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(args)

    return isRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export async function runAiPrompt(
  bindings: Bindings,
  logger: RequestLogger,
  prompt: string,
  logAttributes: Record<string, unknown> = {},
  tools: AiTool[] = [],
): Promise<string> {
  const model = aiModel(bindings)
  const toolsByName = new Map(
    tools.map((tool) => [tool.definition.function.name, tool]),
  )
  const messages: ChatCompletionMessageParam[] = [
    { role: 'user', content: prompt },
  ]
  let text = ''

  for (let step = 0; step < MAX_MODEL_STEPS; step++) {
    const toolsOffered = toolsByName.size > 0 && step < MAX_MODEL_STEPS - 1
    const startedAt = Date.now()
    const result = await bindings.AI.run(model, {
      messages,
      max_tokens: MAX_OUTPUT_TOKENS,
      ...(toolsOffered
        ? { tools: tools.map((tool) => tool.definition) }
        : undefined),
    })
    const reason = finishReason(result)
    const toolCalls = toolsOffered ? extractToolCalls(result) : []

    text = extractResponseText(result)

    logger.debug('AI prompt completed', {
      ...logAttributes,
      model,
      step,
      promptCharacters: prompt.length,
      durationMs: Date.now() - startedAt,
      finishReason: reason,
      toolCalls: toolCalls.map((call) => call.name),
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

    if (toolCalls.length === 0) {
      return text
    }

    const assistantToolCalls: ChatCompletionMessageToolCall[] = toolCalls.map(
      (call) => ({
        id: call.id,
        type: 'function',
        function: { name: call.name, arguments: call.arguments },
      }),
    )

    messages.push({
      role: 'assistant',
      content: text || null,
      tool_calls: assistantToolCalls,
    })

    for (const call of toolCalls) {
      const tool = toolsByName.get(call.name)

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: tool
          ? await tool.run(parseToolArguments(call.arguments))
          : `Unknown tool: ${call.name}`,
      })
    }
  }

  return text
}
