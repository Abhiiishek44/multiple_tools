import { randomUUID } from 'node:crypto'
import { readFile, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'
import { RequestAbortedError, TimeoutError } from '../errors.js'
import { HttpClient } from '../internal/http.js'
import { parseJob } from '../internal/validation.js'
import type { Job } from '../models.js'

const JOBS_PATH = '/v1/jobs'

export type FileInput = string | Buffer | Blob

export interface CreateJobParams {
  tool: string
  file: FileInput
  options?: Readonly<Record<string, unknown>>
  idempotencyKey?: string
  filename?: string
  mediaType?: string
  signal?: AbortSignal
}

export interface WaitForJobOptions {
  /** Maximum total wait time in milliseconds. Set to `null` to wait indefinitely. */
  timeout?: number | null
  /** Delay between status requests in milliseconds. */
  pollInterval?: number
  signal?: AbortSignal
}

export interface DownloadOptions {
  destination?: string
  signal?: AbortSignal
}

export class JobsResource {
  readonly #http: HttpClient

  /** @internal */
  constructor(http: HttpClient) {
    this.#http = http
  }

  async create(params: CreateJobParams): Promise<Job> {
    const tool = canonicalTool(params.tool)
    const upload = await prepareUpload(params.file, params.filename, params.mediaType)
    const form = new FormData()
    form.set('tool', tool)
    form.set('file', upload.blob, upload.filename)
    if (params.options !== undefined) {
      try {
        form.set('options', JSON.stringify(params.options))
      } catch (error) {
        throw new TypeError('options must be JSON serializable', { cause: error })
      }
    }

    const idempotencyKey = params.idempotencyKey?.trim() || randomUUID()
    const payload = await this.#http.requestJSON<unknown>('POST', JOBS_PATH, {
      body: form,
      headers: { 'Idempotency-Key': idempotencyKey },
      retryable: true,
      ...(params.signal ? { signal: params.signal } : {}),
    })
    return parseJob(payload)
  }

  async get(jobId: string, options: { signal?: AbortSignal } = {}): Promise<Job> {
    const payload = await this.#http.requestJSON<unknown>('GET', jobPath(jobId), options)
    return parseJob(payload)
  }

  async wait(jobId: string, options: WaitForJobOptions = {}): Promise<Job> {
    const timeout = options.timeout === undefined ? 300_000 : options.timeout
    const pollInterval = options.pollInterval ?? 1_000
    if (timeout !== null && (!Number.isFinite(timeout) || timeout < 0)) {
      throw new RangeError('timeout must be a non-negative number or null')
    }
    if (!Number.isFinite(pollInterval) || pollInterval <= 0) {
      throw new RangeError('pollInterval must be greater than zero')
    }

    const startedAt = Date.now()
    while (true) {
      const job = await this.get(jobId, options.signal ? { signal: options.signal } : {})
      if (job.isTerminal) return job
      const remaining = timeout === null ? pollInterval : timeout - (Date.now() - startedAt)
      if (remaining <= 0) throw new TimeoutError(`Timed out waiting for job ${jobId}`)
      await delay(Math.min(pollInterval, remaining), options.signal)
    }
  }

  async download(jobId: string, options?: { signal?: AbortSignal }): Promise<Buffer>
  async download(jobId: string, destination: string): Promise<string>
  async download(jobId: string, options: DownloadOptions & { destination: string }): Promise<string>
  async download(jobId: string, options: string | DownloadOptions = {}): Promise<Buffer | string> {
    const downloadOptions = typeof options === 'string' ? { destination: options } : options
    const contents = Buffer.from(await this.#http.requestBytes('GET', `${jobPath(jobId)}/output`, {
      ...(downloadOptions.signal ? { signal: downloadOptions.signal } : {}),
    }))
    if (!downloadOptions.destination) return contents

    const destination = downloadOptions.destination
    await mkdir(dirname(destination), { recursive: true })
    const temporary = `${destination}.${randomUUID()}.part`
    try {
      await writeFile(temporary, contents)
      await rename(temporary, destination)
    } catch (error) {
      await rm(temporary, { force: true })
      throw error
    }
    return destination
  }
}

async function prepareUpload(file: FileInput, filename?: string, mediaType?: string): Promise<{ blob: Blob; filename: string }> {
  if (typeof file === 'string') {
    const resolvedName = filename?.trim() || basename(file)
    const contents = await readFile(file)
    return { blob: new Blob([new Uint8Array(contents)], { type: mediaType || mimeType(resolvedName) }), filename: resolvedName }
  }
  if (Buffer.isBuffer(file)) {
    const resolvedName = filename?.trim() || 'upload.bin'
    return { blob: new Blob([new Uint8Array(file)], { type: mediaType || mimeType(resolvedName) }), filename: resolvedName }
  }
  if (file instanceof Blob) {
    const blobName = 'name' in file && typeof file.name === 'string' ? file.name : undefined
    const resolvedName = filename?.trim() || blobName || 'upload.bin'
    const type = mediaType || file.type || mimeType(resolvedName)
    return { blob: type === file.type ? file : new Blob([file], { type }), filename: resolvedName }
  }
  throw new TypeError('file must be a path, Buffer, Blob, or File')
}

function canonicalTool(tool: string): string {
  const value = tool.trim().replaceAll('_', '-')
  if (!value) throw new TypeError('tool must not be empty')
  return value
}

function jobPath(jobId: string): string {
  const value = jobId.trim()
  if (!value) throw new TypeError('jobId must not be empty')
  return `${JOBS_PATH}/${encodeURIComponent(value)}`
}

function mimeType(filename: string): string {
  const extension = extname(filename).toLowerCase()
  const mediaTypes: Readonly<Record<string, string>> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.md': 'text/markdown',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.avif': 'image/avif',
  }
  return mediaTypes[extension] ?? 'application/octet-stream'
}

async function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new RequestAbortedError('Waiting for the Multiple Tools job was aborted')
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new RequestAbortedError('Waiting for the Multiple Tools job was aborted'))
    }, { once: true })
  })
}
