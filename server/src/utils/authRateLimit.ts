import type { Context } from 'hono'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'

const OTP_START_BURST_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const OTP_START_SUSTAINED_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const OTP_CHALLENGE_ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const OTP_EMAIL_ATTEMPT_BURST_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const OTP_EMAIL_ATTEMPT_SUSTAINED_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const PASSKEY_LOGIN_START_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const PASSKEY_LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const PASSKEY_CREATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const AUTH_IP_BURST_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const AUTH_IP_SUSTAINED_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export type AuthRateLimit = {
  scope: string
  identity: string
  limit: number
  windowMilliseconds: number
}

export const authRateLimits = {
  otpStartEmail(email: string): AuthRateLimit {
    return {
      scope: 'otp_start_email',
      identity: email.trim().toLowerCase(),
      limit: 5,
      windowMilliseconds: OTP_START_BURST_WINDOW_MS,
    }
  },
  otpStartEmailDaily(email: string): AuthRateLimit {
    return {
      scope: 'otp_start_email_daily',
      identity: email.trim().toLowerCase(),
      limit: 20,
      windowMilliseconds: OTP_START_SUSTAINED_WINDOW_MS,
    }
  },
  otpCompletionChallenge(challengeId: string): AuthRateLimit {
    return {
      scope: 'otp_completion_challenge',
      identity: challengeId,
      limit: 5,
      windowMilliseconds: OTP_CHALLENGE_ATTEMPT_WINDOW_MS,
    }
  },
  otpCompletionEmail(email: string): AuthRateLimit {
    return {
      scope: 'otp_completion_email',
      identity: email.trim().toLowerCase(),
      limit: 8,
      windowMilliseconds: OTP_EMAIL_ATTEMPT_BURST_WINDOW_MS,
    }
  },
  otpCompletionEmailDaily(email: string): AuthRateLimit {
    return {
      scope: 'otp_completion_email_daily',
      identity: email.trim().toLowerCase(),
      limit: 20,
      windowMilliseconds: OTP_EMAIL_ATTEMPT_SUSTAINED_WINDOW_MS,
    }
  },
  passkeyLoginStartEmail(email: string): AuthRateLimit {
    return {
      scope: 'passkey_login_start_email',
      identity: email.trim().toLowerCase(),
      limit: 10,
      windowMilliseconds: PASSKEY_LOGIN_START_WINDOW_MS,
    }
  },
  passkeyLoginCompletionChallenge(challengeId: string): AuthRateLimit {
    return {
      scope: 'passkey_login_completion_challenge',
      identity: challengeId,
      limit: 3,
      windowMilliseconds: PASSKEY_LOGIN_ATTEMPT_WINDOW_MS,
    }
  },
  passkeyCreateStartUser(userId: string): AuthRateLimit {
    return {
      scope: 'passkey_create_start_user',
      identity: userId,
      limit: 10,
      windowMilliseconds: PASSKEY_CREATE_WINDOW_MS,
    }
  },
  passkeyCreateCompletionUser(userId: string): AuthRateLimit {
    return {
      scope: 'passkey_create_completion_user',
      identity: userId,
      limit: 10,
      windowMilliseconds: PASSKEY_CREATE_WINDOW_MS,
    }
  },
}

export async function enforceAuthRateLimits(
  c: Context,
  limits: AuthRateLimit[],
  options: { includeClientIp?: boolean } = {},
): Promise<void> {
  const clientIp = c.req.header('CF-Connecting-IP')?.trim()
  const effectiveLimits =
    clientIp && options.includeClientIp !== false
      ? [
          {
            scope: 'all_auth_ip',
            identity: clientIp,
            limit: 100,
            windowMilliseconds: AUTH_IP_BURST_WINDOW_MS,
          },
          {
            scope: 'all_auth_ip_daily',
            identity: clientIp,
            limit: 1000,
            windowMilliseconds: AUTH_IP_SUSTAINED_WINDOW_MS,
          },
          ...limits,
        ]
      : limits

  for (const limit of effectiveLimits) {
    const result = await c.var.db.authRateLimits.consume(
      limit.scope,
      limit.identity,
      limit.limit,
      limit.windowMilliseconds,
    )

    if (!result.allowed) {
      c.var.logger.warn('Authentication rate limit exceeded', {
        scope: limit.scope,
        retryAfterEpoch: result.retryAfterEpoch,
      })
      throw new ApiError(
        ErrorCode.TooManyAuthAttempts,
        'Too many authentication attempts',
      )
    }
  }
}
