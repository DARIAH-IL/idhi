import type { ErrorCode } from '../models/errorCode'

export class ApiError extends Error {
  constructor(
    readonly errorCode: ErrorCode,
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
