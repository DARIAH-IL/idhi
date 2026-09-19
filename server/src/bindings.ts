import type { Connection } from 'mongoose'
import type { MongoDBConnection } from './do/MongoDBConnection'

export type Bindings = {
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

  OTP_DIGITS?: string
  OTP_MAX_ATTEMPTS?: string

  SENTRY_DSN: string
  SENTRY_DISABLED?: string

  SERVER_ALLOWED_HOSTS: string

  EMAIL: SendEmail
  EMAIL_FROM_ADDRESS: string
}
