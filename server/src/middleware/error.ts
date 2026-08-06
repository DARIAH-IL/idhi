import type { ErrorHandler, MiddlewareHandler } from 'hono'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import type { Error as ErrorResponse } from '../models/error'

function internalServerError(): Response {
  const error: ErrorResponse = {
    errorCode: ErrorCode.InvalidInput,
    message: 'An unexpected error occurred',
  }

  return Response.json(error, { status: 500 })
}

export const errorResponseMiddleware: MiddlewareHandler = async (c, next) => {
  await next()

  if (c.res.status >= 400 && c.res.status < 500) {
    c.get('logger').warn('Client error response', {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
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

    const response: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
    }

    return Response.json(response, { status: error.status })
  }

  c.get('logger').error('Unhandled request error', {
    method: c.req.method,
    path: c.req.path,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  })

  return internalServerError()
}
