# Multiple Tools TypeScript SDK

Official, typed Node.js client for the Multiple Tools file-conversion API. It
contains no backend business logic and communicates with the service only over
HTTP.

## Requirements

- Node.js 20 or newer
- A Multiple Tools API key with the scopes needed by your application

## Install

```bash
npm install multipletools
```

## Quick start

```ts
import { Client } from 'multipletools'

const client = new Client({ apiKey: process.env.MULTIPLETOOLS_API_KEY! })

const job = await client.jobs.create({
  tool: 'pdf-to-word',
  file: './document.pdf',
})

const completed = await client.jobs.wait(job.id)

if (completed.status === 'SUCCESS') {
  await client.jobs.download(completed.id, {
    destination: './output/converted.docx',
  })
} else {
  console.error(completed.error)
}
```

The client uses the production API at `https://api.multipletools.com` by
default. Point it at a local or self-hosted API when needed:

```ts
const client = new Client({
  apiKey: 'mt_live_...',
  baseURL: 'http://localhost:8000',
  timeout: 60_000,
  maxRetries: 2,
})
```

Timeout and polling values are expressed in milliseconds.

## Client API

### Health

```ts
const health = await client.health()
console.log(health.status)
```

### List tools

```ts
const tools = await client.tools.list()
for (const tool of tools) {
  console.log(tool.name, tool.inputSuffixes, tool.outputSuffix)
}
```

### Create a job

`file` accepts a filesystem path, `Buffer`, `Blob`, or `File`. Pass `filename`
when a `Buffer` or unnamed `Blob` needs a meaningful upload name.

```ts
const job = await client.jobs.create({
  tool: 'compress-pdf',
  file: pdfBuffer,
  filename: 'report.pdf',
  mediaType: 'application/pdf',
  options: { quality: 'balanced' },
  idempotencyKey: 'invoice-2026-09-13',
})
```

When `idempotencyKey` is omitted, the SDK generates one. Reuse your own stable
key when retrying the same operation across processes.

### Get or wait for a job

```ts
const current = await client.jobs.get(job.id)

const completed = await client.jobs.wait(job.id, {
  timeout: 5 * 60_000,
  pollInterval: 1_000,
})
```

Set `timeout: null` to wait without a deadline. `SUCCESS` and `FAILED` are
terminal statuses.

### Download output

Without a destination, `download` returns a `Buffer`:

```ts
const output = await client.jobs.download(job.id)
```

With a destination, it creates parent directories, writes to a temporary file,
and atomically moves the completed download into place:

```ts
const path = await client.jobs.download(job.id, {
  destination: './output/result.docx',
})

// The Python-style destination shorthand is also supported:
await client.jobs.download(job.id, './output/result.docx')
```

Every operation accepts an optional `AbortSignal`.

```ts
const controller = new AbortController()
const pending = client.jobs.wait(job.id, { signal: controller.signal })
controller.abort()
await pending
```

## Errors

All SDK errors extend `MultipleToolsError`. HTTP failures are exposed as typed
`APIError` subclasses:

```ts
import { AuthenticationError, RateLimitError } from 'multipletools'

try {
  await client.tools.list()
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Check the API key and scopes')
  } else if (error instanceof RateLimitError) {
    console.error('Retry after', error.retryAfter)
  }
}
```

Available error classes include `ValidationError`, `AuthenticationError`,
`PermissionDeniedError`, `NotFoundError`, `ConflictError`, `RateLimitError`,
`TimeoutError`, `ConnectionError`, `RequestAbortedError`, and
`ResponseValidationError`.

GET/HEAD requests retry transient network failures and HTTP 408, 429, 502, 503,
and 504 responses with bounded exponential jitter. Job creation uses the same
policy because it always carries an idempotency key. Other unsafe requests are
never retried automatically.

## Development and publishing

```bash
npm install
npm test
npm pack --dry-run
```

Publishing runs the complete test suite through `prepublishOnly`. The package
is configured for public npm access and provenance. Releases can be published
manually with `npm publish` or through the repository's npm trusted-publishing
workflow.
