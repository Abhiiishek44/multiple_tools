import type { Tool } from '../models.js'
import { HttpClient } from '../internal/http.js'
import { parseTools } from '../internal/validation.js'

const TOOLS_PATH = '/v1/tools'

export class ToolsResource {
  readonly #http: HttpClient

  /** @internal */
  constructor(http: HttpClient) {
    this.#http = http
  }

  async list(options: { signal?: AbortSignal } = {}): Promise<readonly Tool[]> {
    const payload = await this.#http.requestJSON<unknown>('GET', TOOLS_PATH, options)
    return parseTools(payload)
  }
}

