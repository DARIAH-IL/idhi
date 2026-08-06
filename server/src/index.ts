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
import { requestLoggerMiddleware } from './middleware/logger'
import { Bindings } from './bindings'

const app = new Hono<{ Bindings: Bindings; Variables: {} }>()

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
  const allowedHosts = (c.env.SERVER_ALLOWED_HOSTS ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

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
app.use('*', errorResponseMiddleware)
app.use('*', databaseMiddleware)
app.use('*', authMiddleware)

app.route('/', generatedRoutes)
app.onError(unhandledErrorHandler)

export default app
