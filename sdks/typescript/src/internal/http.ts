import {
  APIError,
  AuthenticationError,
  ConflictError,
  ConnectionError,
  MultipleToolsError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  RequestAbortedError,
  ResponseValidationError,
  TimeoutError,
  ValidationError,
} from '../errors.js'
import { VERSION } from '../version.js'

const RETRYABLE_STATUSES = new Set([408, 429, 502, 503, 504])

type Fetch = typeof globalThis.fetch

export interface HttpClientOptions {
  apiKey: string
  baseURL: string
  timeout: number
  maxRetries: number
  fetch?: Fetch
}

export interface RequestOptions extends Omit<RequestInit, 'method'> {
  retryable?: boolean
}

export class HttpClient {
  readonly #apiKey: string
  readonly #baseURL: string
  readonly #timeout: number
  readonly #maxRetries: number
  readonly #fetch: Fetch

  constructor(options: HttpClientOptions) {
    this.#apiKey = options.apiKey
    this.#baseURL = options.baseURL.replace(/\/+$/, '')
    this.#timeout = options.timeout
    this.#maxRetries = options.maxRetries
    this.#fetch = options.fetch ?? globalThis.fetch
  }

  async requestJSON<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    return this.request(method, path, options, async (response) => {
      if (response.status === 204) return undefined as T
      try {
        return await response.json() as T
      } catch (error) {
        throw new ResponseValidationError('The Multiple Tools API returned invalid JSON', { cause: error })
      }
    })
  }

  requestBytes(method: string, path: string, options: RequestOptions = {}): Promise<ArrayBuffer> {
    return this.request(method, path, options, (response) => response.arrayBuffer())
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions,
    consume: (response: Response) => Promise<T>,
  ): Promise<T> {
    const normalizedMethod = method.toUpperCase()
    const retryable = options.retryable ?? (normalizedMethod === 'GET' || normalizedMethod === 'HEAD')
    const attempts = retryable ? this.#maxRetries + 1 : 1

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const timeoutController = new AbortController()
      let didTimeout = false
      const timeoutId = setTimeout(() => {
        didTimeout = true
        timeoutController.abort()
      }, this.#timeout)
      const signal = combineSignals(options.signal, timeoutController.signal)
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${this.#apiKey}`)
      headers.set('Accept', 'application/json')
      headers.set('User-Agent', `multipletools-typescript/${VERSION}`)

      try {
        const { retryable: _retryable, ...requestOptions } = options
        const response = await this.#fetch(`${this.#baseURL}${path}`, {
          ...requestOptions,
          method: normalizedMethod,
          headers,
          signal,
          redirect: 'manual',
        } as RequestInit)

        if (RETRYABLE_STATUSES.has(response.status) && attempt + 1 < attempts) {
          await discardBody(response)
          clearTimeout(timeoutId)
          await sleep(retryDelay(attempt, response.headers.get('retry-after')), options.signal)
          continue
        }
        if (!response.ok) await throwAPIError(response)
        const result = await consume(response)
        clearTimeout(timeoutId)
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof MultipleToolsError) throw error
        if (options.signal?.aborted) throw new RequestAbortedError('The Multiple Tools API request was aborted', { cause: error })

        const sdkError = didTimeout
          ? new TimeoutError('The Multiple Tools API request timed out', { cause: error })
          : new ConnectionError(`Could not reach the Multiple Tools API: ${errorMessage(error)}`, { cause: error })
        if (attempt + 1 >= attempts) throw sdkError
        await sleep(retryDelay(attempt), options.signal)
      }
    }

    throw new Error('Unreachable')
  }
}

function combineSignals(first: AbortSignal | null | undefined, second: AbortSignal): AbortSignal {
  return first ? AbortSignal.any([first, second]) : second
}

async function discardBody(response: Response): Promise<void> {
  try {
    await response.arrayBuffer()
  } catch {
    // A failed retry response body does not need to be preserved.
  }
}

async function sleep(milliseconds: number, signal?: AbortSignal | null): Promise<void> {
  if (signal?.aborted) throw new RequestAbortedError('The Multiple Tools API request was aborted')
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new RequestAbortedError('The Multiple Tools API request was aborted'))
    }, { once: true })
  })
}

function retryDelay(attempt: number, retryAfter?: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.min(Math.max(0, seconds * 1_000), 2_000)
    const date = Date.parse(retryAfter)
    if (!Number.isNaN(date)) return Math.min(Math.max(0, date - Date.now()), 2_000)
  }
  return Math.random() * Math.min(250 * (2 ** attempt), 2_000)
}

async function throwAPIError(response: Response): Promise<never> {
  let details: unknown
  try {
    details = await response.json()
  } catch {
    details = undefined
  }

  const body = isObject(details) && isObject(details.error) ? details.error : details
  const detail = isObject(body) ? body.message ?? body.detail : undefined
  const code = isObject(body) && body.code != null ? String(body.code) : undefined
  const message = detail == null ? `Multiple Tools API returned HTTP ${response.status}` : String(detail)
  const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
  const ErrorClass = errorClass(response.status)
  throw new ErrorClass(message, {
    statusCode: response.status,
    ...(code ? { code } : {}),
    ...(response.headers.get('x-request-id') ? { requestId: response.headers.get('x-request-id')! } : {}),
    ...(details === undefined ? {} : { details }),
    ...(retryAfter === undefined ? {} : { retryAfter }),
    headers: response.headers,
  })
}

function errorClass(status: number): typeof APIError {
  if (status === 400 || status === 422) return ValidationError
  if (status === 401) return AuthenticationError
  if (status === 403) return PermissionDeniedError
  if (status === 404) return NotFoundError
  if (status === 409) return ConflictError
  if (status === 429) return RateLimitError
  return APIError
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds)
  const date = Date.parse(value)
  return Number.isNaN(date) ? undefined : Math.max(0, (date - Date.now()) / 1_000)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
