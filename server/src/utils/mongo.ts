import { mongo } from 'mongoose'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof mongo.MongoServerError &&
    error.code === MONGO_DUPLICATE_KEY_ERROR_CODE
  )
}
