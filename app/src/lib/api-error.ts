import axios from 'axios'
import type { ParseKeys } from 'i18next'
import type { ErrorCode, ErrorResponse } from '@/api/models'
import { ErrorCode as ErrorCodes } from '@/api/models'
import i18n from '@/i18n'

const errorTranslationKeys = {
  [ErrorCodes.Unauthorized]: 'api.errors.Unauthorized',
  [ErrorCodes.InvalidInput]: 'api.errors.InvalidInput',
  [ErrorCodes.InternalServerError]: 'api.errors.InternalServerError',
  [ErrorCodes.EntityNotFound]: 'api.errors.EntityNotFound',
  [ErrorCodes.UserNotFound]: 'api.errors.UserNotFound',
  [ErrorCodes.UserAlreadyInvitedOrRegistered]:
    'api.errors.UserAlreadyInvitedOrRegistered',
  [ErrorCodes.WrongOtpCode]: 'api.errors.WrongOtpCode',
  [ErrorCodes.TooManyAuthAttempts]: 'api.errors.TooManyAuthAttempts',
  [ErrorCodes.AuthChallengeNotFoundOrExpired]:
    'api.errors.AuthChallengeNotFoundOrExpired',
} as const satisfies Record<ErrorCode, ParseKeys>

function isErrorCode(value: unknown): value is ErrorCode {
  return (
    typeof value === 'string' &&
    Object.values(ErrorCodes).some((code) => code === value)
  )
}

export function getApiErrorResponse(error: unknown): ErrorResponse | undefined {
  if (!axios.isAxiosError(error)) return undefined

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return undefined

  if (!('errorCode' in data) || !('message' in data)) return undefined
  const { errorCode, message } = data
  if (typeof message !== 'string' || !isErrorCode(errorCode)) {
    return undefined
  }

  return {
    errorCode,
    message,
    ...('entityId' in data && typeof data.entityId === 'string'
      ? { entityId: data.entityId }
      : {}),
  }
}

export function getApiErrorMessage(error: unknown): string {
  const response = getApiErrorResponse(error)
  if (response) return i18n.t(errorTranslationKeys[response.errorCode])

  return i18n.t(
    axios.isAxiosError(error) && !error.response
      ? 'api.errors.network'
      : 'api.errors.generic',
  )
}
