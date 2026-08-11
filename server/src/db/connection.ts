import { createConnection, type Connection } from 'mongoose'

let connectionPromise: Promise<Connection> | undefined

export function connectToDatabase(
  connectionString: string,
  databaseName: string,
): Promise<Connection> {
  if (!connectionPromise) {
    connectionPromise = createConnection(connectionString, {
      dbName: databaseName,
    })
      .asPromise()
      .catch((error) => {
        connectionPromise = undefined
        throw error
      })
  }

  return connectionPromise
}
