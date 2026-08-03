import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {Bindings, Variables} from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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

app.get('/api/health', (c) => c.json({ ok: true }))

export default app
