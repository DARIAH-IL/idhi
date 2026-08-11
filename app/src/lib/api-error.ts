import axios from 'axios'
import type { ErrorCode, ErrorResponse } from '@/api/models'
import { ErrorCode as ErrorCodes } from '@/api/models'
import i18n from '@/i18n'

const errorTranslationKeys: Record<ErrorCode, string> = {
  [ErrorCodes.Unauthorized]: 'api.errors.Unauthorized',
  [ErrorCodes.InvalidInput]: 'api.errors.InvalidInput',
  [ErrorCodes.EntityNotFound]: 'api.errors.EntityNotFound',
  [ErrorCodes.UserNotFound]: 'api.errors.UserNotFound',
  [ErrorCodes.UserAlreadyInvitedOrRegistered]:
    'api.errors.UserAlreadyInvitedOrRegistered',
  [ErrorCodes.WrongOtpCode]: 'api.errors.WrongOtpCode',
  [ErrorCodes.TooManyAuthAttempts]: 'api.errors.TooManyAuthAttempts',
  [ErrorCodes.AuthChallengeNotFoundOrExpired]:
    'api.errors.AuthChallengeNotFoundOrExpired',
}

export function getApiErrorResponse(error: unknown): ErrorResponse | undefined {
  if (!axios.isAxiosError(error)) return undefined

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return undefined

  const { errorCode, message } = data as Record<string, unknown>
  if (
    typeof message !== 'string' ||
    !Object.values(ErrorCodes).includes(errorCode as ErrorCode)
  ) {
    return undefined
  }

  return data as ErrorResponse
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
