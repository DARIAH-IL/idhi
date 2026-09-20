import type { Context } from 'hono'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'

const SUGGESTION_BURST_WINDOW_MS = 60 * 1000
const SUGGESTION_BURST_LIMIT = 3
const SUGGESTION_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000
const SUGGESTION_DAILY_LIMIT = 100

const suggestionRateLimits = [
  {
    scope: 'entity_suggestion_user',
    limit: SUGGESTION_BURST_LIMIT,
    windowMilliseconds: SUGGESTION_BURST_WINDOW_MS,
  },
  {
    scope: 'entity_suggestion_user_daily',
    limit: SUGGESTION_DAILY_LIMIT,
    windowMilliseconds: SUGGESTION_DAILY_WINDOW_MS,
  },
]

export async function enforceSuggestionRateLimits(
  c: Context,
  userId: string,
): Promise<void> {
  for (const limit of suggestionRateLimits) {
    const result = await c.var.db.authRateLimits.consume(
      limit.scope,
      userId,
      limit.limit,
      limit.windowMilliseconds,
    )

    if (!result.allowed) {
      c.var.logger.warn('Entity suggestion rate limit exceeded', {
        scope: limit.scope,
        limit: limit.limit,
        retryAfterEpoch: result.retryAfterEpoch,
      })

      throw new ApiError(
        ErrorCode.AiSuggestionsLimitReached,
        'Too many suggestion requests',
      )
    }
  }
}
