export const CURL_QUICKSTART = `curl -X POST "$MULTIPLETOOLS_BASE_URL/v1/tools/pdf-to-word/jobs" \\
  -H "Authorization: Bearer $MULTIPLETOOLS_API_KEY" \\
  -H "Idempotency-Key: my-unique-request-id" \\
  -F "file=@document.pdf"`

export const JOB_RESPONSE = `{
  "id": "job_01H...",
  "tool_name": "pdf-to-word",
  "status": "PENDING",
  "progress": 0,
  "input_filename": "document.pdf",
  "output_filename": null,
  "output_url": null,
  "error": null,
  "created_at": "2026-09-12T10:30:00Z"
}`

export const PYTHON_INSTALL = `pip install multipletools`

export const PYTHON_SYNC = `from multipletools import Client

with Client(
    api_key="mt_live_...",
    base_url="https://api.example.com",
    timeout=60.0,
) as client:
    job = client.jobs.create(
        tool="pdf-to-word",
        file="document.pdf",
    )
    job = client.jobs.wait(job.id)

    if job.status == "SUCCESS":
        client.jobs.download(job.id, "converted.docx")`

export const PYTHON_ASYNC = `import asyncio
from multipletools import AsyncClient

async def convert() -> None:
    async with AsyncClient(api_key="mt_live_...") as client:
        job = await client.jobs.create_and_wait(
            tool="pdf-to-word",
            file="document.pdf",
        )
        await client.jobs.download(job.id, "converted.docx")

asyncio.run(convert())`

export const PYTHON_ENV = `export MULTIPLETOOLS_API_KEY="mt_live_..."
export MULTIPLETOOLS_BASE_URL="https://api.example.com"`

export const PYTHON_OPTIONS = `job = client.jobs.create(
    tool="image-compressor",
    file="photo.jpg",
    options={"quality": 82},
    idempotency_key="upload-2026-09-12-001",
    media_type="image/jpeg",
)`

export const TYPESCRIPT_INSTALL = `npm install multipletools`

export const TYPESCRIPT_ENV = `export MULTIPLETOOLS_API_KEY="mt_live_..."
export MULTIPLETOOLS_BASE_URL="https://api.example.com"`

export const TYPESCRIPT_SHORTCUT = `import { Client } from 'multipletools'

const client = new Client({
  apiKey: process.env.MULTIPLETOOLS_API_KEY!,
  baseURL: process.env.MULTIPLETOOLS_BASE_URL!,
})

const job = await client.convert.pdf_to_word('./document.pdf')
const completed = await client.jobs.wait(job.id)

if (completed.status === 'SUCCESS') {
  await client.jobs.download(completed.id, './converted.docx')
}`

export const TYPESCRIPT_GENERIC_JOB = `const job = await client.jobs.create({
  tool: 'image-compressor',
  file: './photo.jpg',
  options: { quality: 82 },
  idempotencyKey: 'upload-2026-09-13-001',
  mediaType: 'image/jpeg',
})`

export const TYPESCRIPT_BUFFER = `const output = await client.jobs.download(job.id)

// Or write atomically to a destination:
await client.jobs.download(job.id, {
  destination: './output/result.docx',
})`

export const SDK_EXCEPTIONS = [
  'AuthenticationError',
  'PermissionDeniedError',
  'ValidationError',
  'NotFoundError',
  'ConflictError',
  'RateLimitError',
  'ConnectionError',
  'TimeoutError',
  'ResponseValidationError',
]
