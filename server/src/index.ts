import {
  withSentry,
  dedupeIntegration,
  inboundFiltersIntegration,
  functionToStringIntegration,
  linkedErrorsIntegration,
} from '@sentry/cloudflare'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { databaseMiddleware } from './middleware/db'
import { authMiddleware } from './middleware/auth'
import {
  errorResponseMiddleware,
  unhandledErrorHandler,
} from './middleware/error'
import generatedRoutes from './routes'
import mcpApp from './mcp/app'
import swaggerApp from './swagger'
import { requestLoggerMiddleware } from './middleware/logger'
import type { Bindings } from './bindings'
import { requiredValue, splitValues } from './utils/values'

const app = new Hono<{ Bindings: Bindings }>()

function normalizeOrigin(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  try {
    return new URL(trimmed).origin.toLowerCase()
  } catch {
    return trimmed.replace(/\/+$/, '').toLowerCase()
  }
}

app.use('*', async (c, next) => {
  c.set('requestId', crypto.randomUUID())
  await next()
})

app.use('*', requestLoggerMiddleware)

app.use('*', async (c, next) => {
  const allowedHosts = splitValues(
    requiredValue(c.env, 'SERVER_ALLOWED_HOSTS'),
  ).map(normalizeOrigin)

  if (allowedHosts.length === 0) {
    throw new Error('SERVER_ALLOWED_HOSTS must contain at least one origin')
  }

  return cors({
    origin: (origin) => {
      if (!origin) {
        return ''
      }
      return allowedHosts.includes(normalizeOrigin(origin)) ? origin : ''
    },
  })(c, next)
})

app.use('*', logger())

app.get('/', (c) => c.redirect('/swagger', 302))

app.route('/', mcpApp)
app.route('/', swaggerApp)

app.use('*', errorResponseMiddleware)
app.use('*', databaseMiddleware)
app.use('*', authMiddleware)

app.route('/', generatedRoutes)
app.onError(unhandledErrorHandler)

export default withSentry(
  (env: Bindings) => ({
    dsn: env.SENTRY_DSN,
    enabled: env.SENTRY_DISABLED !== 'true',
    tracesSampleRate: 0,
    skipOpenTelemetrySetup: true,
    defaultIntegrations: [
      dedupeIntegration(),
      inboundFiltersIntegration(),
      functionToStringIntegration(),
      linkedErrorsIntegration(),
    ],
  }),
  { fetch: app.fetch },
)
