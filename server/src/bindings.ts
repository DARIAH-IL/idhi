export type Bindings = {
  DEFAULT_LANG?: string

  FRONTEND_URL: string

  JWT_EXPIRATION_SECONDS?: string
  JWT_SECRET: string

  MONGODB_CONNECTION_STRING: string
  MONGODB_DATABASE_NAME: string

  OTP_DIGITS?: string
  OTP_MAX_ATTEMPTS?: string

  SENTRY_DSN: string
  SENTRY_DISABLED?: string

  SERVER_ALLOWED_HOSTS: string

  SMTP_FROM_EMAIL: string
  SMTP_HOST: string
  SMTP_PASSWORD: string
  SMTP_PORT?: string
  SMTP_SECURE?: string
  SMTP_USERNAME: string
}
