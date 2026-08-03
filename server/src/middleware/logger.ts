import type { MiddlewareHandler } from 'hono'

export type RequestLogger = {
  debug(message: string, attributes: Record<string, unknown>): void
  warn(message: string, attributes: Record<string, unknown>): void
  error(message: string, attributes: Record<string, unknown>): void
}

function log(
  level: 'debug' | 'warn' | 'error',
  message: string,
  requestId: string,
  attributes: Record<string, unknown>,
): void {
  console[level](
    JSON.stringify({
      level,
      message,
      requestId,
      ...attributes,
    }),
  )
}

export const requestLoggerMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.get('requestId')

  c.set('logger', {
    debug(message, attributes) {
      log('debug', message, requestId, attributes)
    },
    warn(message, attributes) {
      log('warn', message, requestId, attributes)
    },
    error(message, attributes) {
      log('error', message, requestId, attributes)
    },
  })

  return next()
}
