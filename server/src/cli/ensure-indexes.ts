import { pathToFileURL } from 'node:url'
import { connectToDatabase } from '../db/connection.ts'
import { ensureIndexes } from '../db/indexes/ensure.ts'

async function main(): Promise<void> {
  const connectionString = process.env.MONGODB_CONNECTION_STRING
  const databaseName = process.env.MONGODB_DATABASE_NAME

  if (!connectionString || !databaseName) {
    // eslint-disable-next-line no-console
    console.error(
      'MONGODB_CONNECTION_STRING and MONGODB_DATABASE_NAME must be set (server/.env.local is loaded automatically).',
    )
    process.exit(1)
  }

  const connection = await connectToDatabase(connectionString, databaseName)

  try {
    const { db } = connection

    if (!db) {
      throw new Error('Database connection is not available')
    }

    await ensureIndexes(db)

    // eslint-disable-next-line no-console
    console.log(`Indexes ensured on database "${databaseName}".`)
  } finally {
    await connection.close()
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main()
}
