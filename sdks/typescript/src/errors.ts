export class MultipleToolsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = new.target.name
  }
}

export class ConnectionError extends MultipleToolsError {}
export class TimeoutError extends MultipleToolsError {}
export class RequestAbortedError extends MultipleToolsError {}
export class ResponseValidationError extends MultipleToolsError {}

export interface APIErrorOptions {
  statusCode: number
  code?: string
  requestId?: string
  details?: unknown
  retryAfter?: number
  headers?: Headers
}

export class APIError extends MultipleToolsError {
  readonly statusCode: number
  readonly code: string | undefined
  readonly requestId: string | undefined
  readonly details: unknown
  readonly retryAfter: number | undefined
  readonly headers: Readonly<Record<string, string>>

  constructor(message: string, options: APIErrorOptions) {
    super(message)
    this.statusCode = options.statusCode
    this.code = options.code
    this.requestId = options.requestId
    this.details = options.details
    this.retryAfter = options.retryAfter
    this.headers = Object.freeze(Object.fromEntries(options.headers?.entries() ?? []))
  }
}

export class ValidationError extends APIError {}
export class AuthenticationError extends APIError {}
export class PermissionDeniedError extends APIError {}
export class NotFoundError extends APIError {}
export class ConflictError extends APIError {}
export class RateLimitError extends APIError {}
