import { HttpClient } from './internal/http.js'
import { parseHealth } from './internal/validation.js'
import type { Health } from './models.js'
import { JobsResource } from './resources/jobs.js'
import { ToolsResource } from './resources/tools.js'

export const DEFAULT_BASE_URL = 'https://api.multipletools.com'

export interface ClientOptions {
  apiKey: string
  baseURL?: string
  /** Per-request timeout in milliseconds. Defaults to 30 seconds. */
  timeout?: number
  /** Number of retries after the initial safe request. Defaults to 2. */
  maxRetries?: number
}

export class Client {
  readonly tools: ToolsResource
  readonly jobs: JobsResource
  readonly #http: HttpClient

  constructor(options: ClientOptions) {
    const apiKey = options.apiKey?.trim()
    if (!apiKey) throw new TypeError('apiKey is required')
    const baseURL = validateBaseURL(options.baseURL ?? DEFAULT_BASE_URL)
    const timeout = options.timeout ?? 30_000
    const maxRetries = options.maxRetries ?? 2
    if (!Number.isFinite(timeout) || timeout <= 0) throw new RangeError('timeout must be greater than zero')
    if (!Number.isInteger(maxRetries) || maxRetries < 0) throw new RangeError('maxRetries must be a non-negative integer')

    this.#http = new HttpClient({ apiKey, baseURL, timeout, maxRetries })
    this.tools = new ToolsResource(this.#http)
    this.jobs = new JobsResource(this.#http)
  }

  async health(options: { signal?: AbortSignal } = {}): Promise<Health> {
    return parseHealth(await this.#http.requestJSON<unknown>('GET', '/health', options))
  }
}

function validateBaseURL(value: string): string {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch (error) {
    throw new TypeError('baseURL must be an absolute HTTP or HTTPS URL', { cause: error })
  }
  if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || !parsed.host) {
    throw new TypeError('baseURL must be an absolute HTTP or HTTPS URL')
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '')
  parsed.search = ''
  parsed.hash = ''
  return parsed.toString().replace(/\/$/, '')
}

