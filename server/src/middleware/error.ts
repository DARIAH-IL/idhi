import type { Context, ErrorHandler, MiddlewareHandler } from 'hono'
import { captureException } from '@sentry/cloudflare'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import type { Error as ErrorResponse } from '../models/error'
import { serializeError } from './logger'

const CORRUPTED_DATA_MESSAGE =
  'Stored data is corrupted and does not match the API schema'

const LOGGED_ISSUES_LIMIT = 20

const REPORTED_ISSUES_LIMIT = 5

const errorCodes = new Set<string>(Object.values(ErrorCode))

function isErrorCode(value: string): value is ErrorResponse['errorCode'] {
  return errorCodes.has(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readableOriginalError(value: unknown): unknown {
  if (!isRecord(value)) {
    return value
  }

  const nestedError = isRecord(value.error) ? value.error : value
  const message = nestedError.message

  if (typeof message !== 'string') {
    return nestedError
  }

  try {
    return {
      ...nestedError,
      message: JSON.parse(message),
    }
  } catch {
    return nestedError
  }
}

function declaredErrorResponse(value: unknown): ErrorResponse | undefined {
  if (
    !isRecord(value) ||
    typeof value.errorCode !== 'string' ||
    !isErrorCode(value.errorCode) ||
    typeof value.message !== 'string' ||
    (value.entityId !== undefined && typeof value.entityId !== 'string')
  ) {
    return undefined
  }

  return {
    errorCode: value.errorCode,
    message: value.message,
    ...(value.entityId === undefined ? {} : { entityId: value.entityId }),
  }
}

function jsonResponse(
  body: ErrorResponse,
  status: number,
  sourceHeaders?: Headers,
): Response {
  const headers = new Headers(sourceHeaders)
  headers.delete('content-length')
  headers.set('content-type', 'application/json; charset=UTF-8')

  return Response.json(body, { status, headers })
}

function issueSummary(issue: unknown): Record<string, unknown> {
  if (!isRecord(issue)) {
    return { message: String(issue) }
  }

  return {
    path: Array.isArray(issue.path) ? issue.path.map(String).join('.') : '',
    code: issue.code,
    message: issue.message,
  }
}

function validationIssues(error: unknown): unknown[] {
  if (!isRecord(error) || !Array.isArray(error.issues)) {
    return []
  }

  return error.issues
}

function issueText(issue: unknown): string {
  const summary = issueSummary(issue)
  const path = typeof summary.path === 'string' ? summary.path : ''
  const message =
    typeof summary.message === 'string' ? summary.message : 'Invalid value'

  return path ? `${path}: ${message}` : message
}

export function invalidInputHook(
  result: { success: boolean; error?: unknown },
  c: Context,
): Response | undefined {
  if (result.success) {
    return undefined
  }

  const issues = validationIssues(result.error)
  const detail = issues
    .slice(0, REPORTED_ISSUES_LIMIT)
    .map(issueText)
    .join('; ')

  c.get('logger').warn('Request failed input validation', {
    method: c.req.method,
    path: c.req.path,
    issueCount: issues.length,
    issues: issues.slice(0, LOGGED_ISSUES_LIMIT).map(issueSummary),
  })

  return jsonResponse(
    {
      errorCode: ErrorCode.InvalidInput,
      message: detail ? `Invalid input: ${detail}` : 'Invalid input',
    },
    400,
  )
}

export function corruptedDataHook(
  result: { success: boolean; error?: unknown },
  c: Context,
): Response | undefined {
  if (result.success) {
    return undefined
  }

  const issues = validationIssues(result.error)

  c.get('logger').error('Response failed contract validation', {
    method: c.req.method,
    path: c.req.path,
    issueCount: issues.length,
    issues: issues.slice(0, LOGGED_ISSUES_LIMIT).map(issueSummary),
  })

  return jsonResponse(
    {
      errorCode: ErrorCode.InternalServerError,
      message: CORRUPTED_DATA_MESSAGE,
    },
    500,
  )
}

function internalServerError(sourceHeaders?: Headers): Response {
  const error: ErrorResponse = {
    errorCode: ErrorCode.InternalServerError,
    message: 'An unexpected error occurred',
  }

  return jsonResponse(error, 500, sourceHeaders)
}

export const errorResponseMiddleware: MiddlewareHandler = async (c, next) => {
  await next()

  if (c.res.status < 400) {
    return
  }

  const status = c.res.status
  let responseBody: unknown

  if (c.res.headers.get('content-type')?.includes('application/json')) {
    try {
      responseBody = await c.res.clone().json()
    } catch {
      responseBody = undefined
    }
  }

  const declaredError = declaredErrorResponse(responseBody)

  if (declaredError) {
    c.res = jsonResponse(declaredError, status, c.res.headers)
  } else {
    const originalError = readableOriginalError(responseBody)

    c.get('logger').error('Normalized non-contract error response', {
      method: c.req.method,
      path: c.req.path,
      status,
      responseType: isRecord(responseBody)
        ? Object.keys(responseBody).sort().join(',')
        : typeof responseBody,
      originalError,
    })

    captureException(new Error('Normalized non-contract error response'), {
      extra: {
        method: c.req.method,
        path: c.req.path,
        status,
        originalError,
      },
    })

    c.res = internalServerError(c.res.headers)
    return
  }

  if (status < 500) {
    c.get('logger').warn('Client error response', {
      method: c.req.method,
      path: c.req.path,
      status,
    })
  } else {
    captureException(new Error(declaredError.message), {
      extra: {
        method: c.req.method,
        path: c.req.path,
        status,
        errorCode: declaredError.errorCode,
      },
    })
  }
}

export const unhandledErrorHandler: ErrorHandler = (error, c) => {
  if (error instanceof ApiError) {
    c.get('logger').warn('Application error', {
      method: c.req.method,
      path: c.req.path,
      status: error.status,
      errorCode: error.errorCode,
    })

    if (error.status >= 500) {
      captureException(error, {
        extra: {
          method: c.req.method,
          path: c.req.path,
          status: error.status,
          errorCode: error.errorCode,
        },
      })
    }

    const response: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
    }

    return jsonResponse(response, error.status)
  }

  c.get('logger').error('Unhandled request error', {
    method: c.req.method,
    path: c.req.path,
    error: serializeError(error),
  })

  captureException(error, {
    extra: {
      method: c.req.method,
      path: c.req.path,
    },
  })

  return internalServerError()
}
