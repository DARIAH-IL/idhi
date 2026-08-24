import { createConnection } from 'mongoose'
import type { Connection } from 'mongoose'

export function connectToDatabase(
  connectionString: string,
  databaseName: string,
): Promise<Connection> {
  return createConnection(connectionString, {
    bufferCommands: false,
    dbName: databaseName,
  }).asPromise()
}
