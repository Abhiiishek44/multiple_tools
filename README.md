# Multiple Tools

An extensible asynchronous tool platform built with FastAPI, Celery, Redis,
PostgreSQL, and MinIO object storage.

## Architecture

```text
client -> API -> storage + PostgreSQL job -> Redis
                                            |-- general queue -> general worker
                                            `-- ai_ocr queue  -> AI/OCR worker
                                                                    |
                                                        storage + job result
```

PostgreSQL is the source of truth for job state. Redis transports job IDs only;
uploaded files and generated results are stored through the storage adapter.

```text
apps/
  api/                 FastAPI routes, schemas, and orchestration services
  worker/              Workload-isolated Celery task entry points
packages/
  core/                Environment configuration, errors, and logging
  auth/                User model, repository, and JWT utilities
  jobs/                Job model and repository
  documents/           Text normalization, OpenRouter OCR, and PDF parsing
  storage/             Provider-neutral object-storage contract and factory
plugins/
  pdf_documents_tools/ PDF and document conversion plugins
  image_converter_tools/
    common_raster_conversions/ JPEG, PNG, WEBP, BMP, and TIFF tools
    heic_heif_conversions/     HEIC and HEIF tools
    avif_conversions/          AVIF tools
  ocr_tools/           Image and PDF text-extraction plugins that use OCR
deploy/                 Dockerfiles, Compose, PostgreSQL init, and migrations
infrastructure/         Database, Celery, and S3-compatible runtime adapters
```

## Local setup

```bash
make setup
```

`make setup` creates missing local env files without overwriting existing ones,
generates local authentication secrets, installs dependencies, starts the
infrastructure services, and applies migrations. Add your Google OAuth and
OpenRouter credentials to the generated files when those features are needed.

Start the complete development stack:

```bash
make dev
```

Run `make help` for individual service, validation, build, infrastructure, SDK,
and container-image commands. Production services should receive only the
variables from their matching example file through the deployment platform's
secret manager.

MinIO's object-storage API is available at `http://localhost:9000`; its browser console is
available at `http://localhost:9003`. The application creates the configured
bucket on first use in local development.

Apply migrations to an existing database:

```bash
make db-migrate
```

Start an individual process when needed:

```bash
make api
make worker
make worker-ai
make beat
make web
```

## Railway deployment

Production container definitions, GitHub Actions CI, migration handling, and
the Railway service setup are documented in
[`docs/railway-deployment.md`](docs/railway-deployment.md).

The CI workflow publishes three images on successful pushes to `main`:

```text
ghcr.io/abhiiishek44/multiple-tools-api:latest
ghcr.io/abhiiishek44/multiple-tools-worker:latest
ghcr.io/abhiiishek44/multiple-tools-web:latest
```

Their independent build definitions are under `deploy/docker/`:

```text
deploy/docker/Dockerfile.api
deploy/docker/Dockerfile.worker
deploy/docker/Dockerfile.web
```

Local releases are published to Docker Hub by default:

```bash
docker login
make docker-release
```

This pushes `abhiiishek44/multiple-tools-api`,
`abhiiishek44/multiple-tools-worker`, and `abhiiishek44/multiple-tools-web`
with a version derived from Git. Override the Docker Hub namespace when needed:

```bash
make docker-release IMAGE_REGISTRY=docker.io/your-dockerhub-username
```

Run the worker image as two independent services. The general worker consumes
only the `general` queue and handles normal document conversions plus background
tasks. The AI/OCR worker consumes only the `ai_ocr` queue:

```bash
celery --app=apps.worker.celery_app:celery_app worker --queues=general --hostname=general@%h --loglevel=INFO
celery --app=apps.worker.celery_app:celery_app worker --queues=ai_ocr --hostname=ai-ocr@%h --loglevel=INFO
celery --app=apps.worker.celery_app:celery_app beat --loglevel=INFO
```

Deploy these as three separately scalable processes. Only the AI/OCR worker
needs the OpenRouter credentials below. Queue isolation prevents slow provider
requests from consuming general conversion-worker capacity.

Install LibreOffice on Debian or Ubuntu for the Office conversion plugins:

```bash
sudo apt-get update
sudo apt-get install -y libreoffice
```

LibreOffice handles Word, Excel, and PowerPoint to PDF. OCR uses OpenRouter;
there is no local Tesseract dependency. Configure the worker environment with:

```bash
OPENROUTER_API_KEY=your-secret-api-key
OPENROUTER_OCR_MODEL=your-vision-capable-model
OPENROUTER_CHAT_MODEL=your-chat-capable-model
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_SECONDS=120
```

The API key is a backend secret and must never be exposed to frontend code.
`pdf-to-text` extracts embedded text locally and calls OpenRouter only for pages
whose native text is empty or unusable. Native and OCR text pass through the same
deterministic Unicode and whitespace normalizer before the TXT file is written.

## Document chat

Authenticated users can create a persistent conversation, upload source
documents, and ask grounded questions. TXT, Markdown, DOCX, and PDF uploads are
stored in MinIO and dispatched to `chat.ingest_document` on the isolated
`ai_ocr` queue. The ingestion task extracts text (including OCR fallback for
scanned PDF pages), normalizes it, and stores searchable chunks in PostgreSQL.

```text
POST /v1/chats
POST /v1/chats/{conversation_id}/documents
GET  /v1/chats/{conversation_id}
POST /v1/chats/{conversation_id}/messages
POST /v1/chats/{conversation_id}/messages/stream
```

The standard message endpoint returns JSON. The streaming endpoint returns
server-sent events named `citations`, `token`, `done`, and `error`. Model prompts
contain retrieved document excerpts and recent conversation history; the system
prompt requires grounded answers and treats document text as untrusted input.
Apply migration `012_create_document_chat.sql` before enabling these routes.

## Available tools

```text
pdf-to-word         word-to-pdf
jpg-to-pdf          pdf-to-jpg
png-to-pdf          pdf-to-png
jpg-to-png          png-to-jpg
heic-to-jpg         image-to-text
compress-pdf        pdf-to-excel
excel-to-pdf        pdf-to-powerpoint
powerpoint-to-pdf
rotate-pdf          protect-pdf         unlock-pdf
html-to-pdf         pdf-to-text         text-to-pdf
word-to-text        text-to-word        csv-to-excel
excel-to-csv        csv-to-pdf          markdown-to-pdf
markdown-to-word    word-to-html        html-to-word
pdf-to-html         tiff-to-pdf         bmp-to-pdf
webp-to-pdf

jpg-to-webp        webp-to-jpg        png-to-webp
webp-to-png        bmp-to-jpg         bmp-to-png
jpg-to-bmp         png-to-bmp         tiff-to-jpg
tiff-to-png        jpg-to-tiff        png-to-tiff
heic-to-png        heic-to-webp       jpg-to-heic
png-to-heic        avif-to-jpg        avif-to-png
avif-to-webp       jpg-to-avif        png-to-avif
webp-to-avif
```

`pdf-to-jpg` and `pdf-to-png` return a ZIP containing one image per PDF page.

## API workflow

### Google authentication

Create a Google OAuth 2.0 Web client. The API and worker share the backend
settings in the repository-root `.env` file:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-output-from-openssl
API_KEY_HMAC_SECRET=replace-with-a-different-output-from-openssl
JWT_AUDIENCE=multiple-tools-web
FRONTEND_URL=http://localhost:5173
AUTH_COOKIE_SECURE=false
CORS_ORIGINS=http://localhost:5173
```

Put public browser settings in `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Generate the backend-only JWT secret with:

```bash
openssl rand -hex 32
```

The frontend includes Google Identity Services sign-in. Set both
`GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` to the same OAuth web client ID.
Google Identity Services returns the credential to the frontend through its
popup callback. The frontend posts it as JSON to `/v1/auth/google/callback`,
then the API sets an HTTP-only application cookie and the frontend navigates to
`/dashboard`. On refresh, the frontend restores the signed-in user through
`/v1/auth/me`; application JWTs are never stored in frontend JavaScript or
browser local storage.

Frontend routes are refresh-safe: `/dashboard` shows the categorized catalog,
`/tools/{tool_name}` shows a tool upload screen, and `/jobs/{job_id}` restores a
user-owned job from the backend. Production hosting must serve `index.html` as
the fallback for these client-side routes.

The converter catalog is loaded from `GET /v1/tools`. Selecting a tool uploads
the file to `POST /v1/tools/{tool_name}/jobs`, polls the returned job through
`GET /v1/jobs/{job_id}`, and downloads successful output from the job's output
endpoint. The current registry exposes 56 tools.

### External API keys

Signed-in web users can create, list, and revoke external API keys through
`POST /v1/api-keys`, `GET /v1/api-keys`, and `DELETE /v1/api-keys/{key_id}`.
Creation accepts a name, scopes, and optional expiration timestamp. The raw
`mt_live_<key_id>_<secret>` credential is returned only by the create request;
only its HMAC is stored. Configure a separate `API_KEY_HMAC_SECRET` containing
at least 32 characters before issuing keys.

External clients authenticate with `Authorization: Bearer mt_live_...` and can
use `POST /v1/jobs`, `GET /v1/jobs/{job_id}`, and
`GET /v1/jobs/{job_id}/output`. Available scopes are `tools:read`,
`jobs:create`, `jobs:read`, and `jobs:download`. The existing
`POST /v1/tools/{tool_name}/jobs` web endpoint remains available.

The typed Python SDK lives in `sdks/python` and communicates only with these
HTTP endpoints:

```python
from multipletools import Client

client = Client(api_key="mt_live_...", base_url="https://api.example.com")
job = client.jobs.create(tool="pdf_to_word", file="document.pdf")
job = client.jobs.get(job.id)
client.jobs.download(job.id, "converted.docx")
client.close()
```

The production-ready TypeScript SDK lives in `sdks/typescript` and exposes the
same API as Promise-based Node.js resources:

```ts
import { Client } from 'multipletools'

const client = new Client({ apiKey: 'mt_live_...' })
const job = await client.jobs.create({
  tool: 'pdf-to-word',
  file: './document.pdf',
})
const completed = await client.jobs.wait(job.id)
if (completed.status === 'SUCCESS') {
  await client.jobs.download(job.id, { destination: './converted.docx' })
}
```

Install it with `npm install multipletools`. The production API URL is built
in; pass `baseURL: 'http://localhost:8000'` for local development.

Use the returned bearer token for API-client job requests:

```bash
curl http://localhost:8000/v1/tools

curl -X POST \
  -H "Authorization: Bearer APP_ACCESS_TOKEN" \
  -H "Idempotency-Key: example-001" \
  -F "file=@document.pdf" \
  http://localhost:8000/v1/tools/pdf-to-word/jobs

curl -H "Authorization: Bearer APP_ACCESS_TOKEN" \
  http://localhost:8000/v1/jobs/JOB_ID
curl -OJ -H "Authorization: Bearer APP_ACCESS_TOKEN" \
  http://localhost:8000/v1/jobs/JOB_ID/output
```

Job states are `QUEUED`, `RUNNING`, `SUCCESS`, and `FAILED`.
Every new job is owned by its authenticated user. Status and output endpoints
return `404` when the job does not belong to the caller.

Tools that require settings receive them through the optional multipart
`options` JSON field. Redis still receives only the job ID:

```bash
curl -X POST \
  -H "Idempotency-Key: rotate-example-001" \
  -F 'options={"angle":90}' \
  -F "file=@document.pdf;type=application/pdf" \
  http://localhost:8000/v1/tools/rotate-pdf/jobs

curl -X POST \
  -H "Idempotency-Key: protect-example-001" \
  -F 'options={"password":"change-me"}' \
  -F "file=@document.pdf;type=application/pdf" \
  http://localhost:8000/v1/tools/protect-pdf/jobs
```

`rotate-pdf` defaults to 90 degrees. `protect-pdf` and `unlock-pdf` require a
`password`; `protect-pdf` also accepts an optional `owner_password`.

## Adding a plugin

Create a tool directory with only `manifest.py` and `handler.py`. PDF and
document tools belong under `plugins/pdf_documents_tools/`; image conversion
tools belong in the matching category under `plugins/image_converter_tools/`.
OCR-dependent tools live under `plugins/ocr_tools/`. Both `image_to_text` and
`pdf_to_text` reuse
`packages/documents/ocr/`, which performs OCR exclusively through OpenRouter. The package
normalizes image orientation and transparency, rejects oversized inputs, retries
only transient provider failures, and returns structured text/model/token/cost
metadata. Worker logs include that usage metadata without logging document
contents or API responses. `OCR_MAX_PIXELS` and `OCR_MAX_PAYLOAD_BYTES` configure
the safety limits. The registry discovers nested plugins automatically.
Shared plugin contracts and discovery live in `plugins/base.py` and
`plugins/registry.py`.

Plugins default to the `general` workload. Set `workload="ai_ocr"` in a plugin
manifest when it performs AI or OCR processing; job submission will route it to
the dedicated queue. Ensure the corresponding worker has any external programs
and provider credentials that plugin needs.

## Object storage

API and worker processes use the same `ArtifactStorage` interface and exchange
only object keys such as `jobs/{job_id}/input.pdf`. The current provider is
MinIO, configured with `MINIO_ENDPOINT=localhost:9000` and the other
`MINIO_*` variables in the API and worker environment files.

The MinIO adapter uses boto3 internally to communicate with MinIO.
This is an implementation detail: API routes, workers, and plugins depend only
on `ArtifactStorage`, not on MinIO or boto3.

Job inputs and outputs are temporary objects under `MINIO_TEMP_PREFIX`.
Celery Beat sends `storage.cleanup_temporary` every
`MINIO_CLEANUP_INTERVAL_MINUTES` (30 by default). The worker uses each MinIO
object's `last_modified` timestamp and deletes objects at least
`MINIO_TEMP_RETENTION_MINUTES` old (30 by default). Cleanup never scans outside
the configured temporary prefix and never changes or deletes PostgreSQL job
records.

## Tests

```bash
python -m unittest discover -v
```
