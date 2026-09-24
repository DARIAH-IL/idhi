import type { Connection } from 'mongoose'
import type { MongoDBConnection } from './do/MongoDBConnection'

export type Bindings = {
  AI: Ai
  AI_MODEL?: string

  DEFAULT_LANG?: string

  FRONTEND_URL: string

  JWT_EXPIRATION_SECONDS?: string
  JWT_SECRET: string

  MONGODB_CONNECTION_STRING: string
  MONGODB_DATABASE_NAME: string
  MONGO_CONNECTION: DurableObjectNamespace<
    InstanceType<typeof MongoDBConnection>
  >
  MONGO_CONNECTION_PROMISE?: Promise<Connection>

  MARKETPLACE_API_URL: string
  MARKETPLACE_FRONTEND_URL: string
  MARKETPLACE_USERNAME: string
  MARKETPLACE_PASSWORD: string

  OTP_DIGITS?: string
  OTP_MAX_ATTEMPTS?: string

  SENTRY_DSN: string
  SENTRY_DISABLED?: string

  SERVER_ALLOWED_HOSTS: string

  EMAIL: SendEmail
  EMAIL_FROM_ADDRESS: string
}
