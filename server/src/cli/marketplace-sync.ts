import { pathToFileURL } from 'node:url'
import { connectToDatabase } from '../db/connection'
import { createDatabaseService } from '../db/service'
import { createMarketplaceClient } from '../marketplace/api/client'
import { MarketplaceApiError } from '../marketplace/fetcher'
import { MarketplaceSyncError, syncMarketplace } from '../marketplace/sync'
import type { MarketplaceSyncLogger } from '../marketplace/sync'
import { serializeError } from '../middleware/logger'
import { requiredValue } from '../utils/values'

function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  attributes: Record<string, unknown>,
): void {
  process.stderr.write(
    `${JSON.stringify({ level, message, at: new Date().toISOString(), ...attributes })}\n`,
  )
}

function errorDetails(error: unknown): Record<string, unknown> {
  return {
    ...serializeError(error),
    ...(error instanceof MarketplaceSyncError
      ? { entityId: error.entityId, step: error.step }
      : {}),
    ...(error instanceof MarketplaceApiError
      ? {
          status: error.status,
          method: error.method,
          path: error.path,
          body: error.body,
        }
      : {}),
    ...(error instanceof Error && error.cause !== undefined
      ? { cause: errorDetails(error.cause) }
      : {}),
  }
}

const logger: MarketplaceSyncLogger = {
  debug: (message, attributes) => log('debug', message, attributes),
  info: (message, attributes) => log('info', message, attributes),
  warn: (message, attributes) => log('warn', message, attributes),
  error: (message, attributes) => log('error', message, attributes),
}

async function main(): Promise<void> {
  const env = process.env
  const dryRun = process.argv.includes('--dry-run')

  const connection = await connectToDatabase(
    requiredValue(env, 'MONGODB_CONNECTION_STRING'),
    requiredValue(env, 'MONGODB_DATABASE_NAME'),
  )

  try {
    const db = await createDatabaseService(connection)
    const client = await createMarketplaceClient({
      apiUrl: requiredValue(env, 'MARKETPLACE_API_URL'),
      username: requiredValue(env, 'MARKETPLACE_USERNAME'),
      password: requiredValue(env, 'MARKETPLACE_PASSWORD'),
    })

    const report = await syncMarketplace(
      db,
      client,
      {
        marketplaceUrl: requiredValue(env, 'MARKETPLACE_FRONTEND_URL'),
        frontendUrl: requiredValue(env, 'FRONTEND_URL'),
        auditUserId: requiredValue(env, 'EMAIL_FROM_ADDRESS'),
        dryRun,
      },
      logger,
    )

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  } finally {
    await connection.close()
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main()
  } catch (error) {
    logger.error('Marketplace sync failed', errorDetails(error))
    process.exitCode = 1
  }
}
