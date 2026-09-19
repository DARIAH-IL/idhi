import { DurableObject } from 'cloudflare:workers'
import type { Connection } from 'mongoose'
import {
  instrumentDurableObjectWithSentry,
  dedupeIntegration,
  inboundFiltersIntegration,
  functionToStringIntegration,
  linkedErrorsIntegration,
} from '@sentry/cloudflare'
import { connectToDatabase } from '../db/connection'
import { app } from '../app'
import type { Bindings } from '../bindings'

class MongoDBConnectionBase extends DurableObject<Bindings> {
  private connectionPromise: Promise<Connection>

  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env)
    this.connectionPromise = connectToDatabase(
      env.MONGODB_CONNECTION_STRING,
      env.MONGODB_DATABASE_NAME,
    )
  }

  async fetch(request: Request): Promise<Response> {
    const connectionPromise = this.connectionPromise

    connectionPromise.catch(() => {
      if (this.connectionPromise === connectionPromise) {
        this.connectionPromise = connectToDatabase(
          this.env.MONGODB_CONNECTION_STRING,
          this.env.MONGODB_DATABASE_NAME,
        )
      }
    })

    return app.fetch(
      request,
      { ...this.env, MONGO_CONNECTION_PROMISE: connectionPromise },
      {
        waitUntil: (promise: Promise<unknown>) => this.ctx.waitUntil(promise),
        passThroughOnException: () => {},
        props: {},
      },
    )
  }
}

export const MongoDBConnection = instrumentDurableObjectWithSentry(
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
  MongoDBConnectionBase,
)
