# Multiple Tools

An extensible asynchronous tool platform built with FastAPI, Celery, Redis,
PostgreSQL, and MinIO object storage.

## Architecture

```text
client -> API -> storage + PostgreSQL job -> Redis queue -> worker -> plugin
                                                      -> storage + job result
```

PostgreSQL is the source of truth for job state. Redis transports job IDs only;
uploaded files and generated results are stored through the storage adapter.

```text
apps/
  api/                 FastAPI routes, schemas, and orchestration services
  worker/              Generic Celery task
packages/
  core/                Configuration, database, job repository, errors
  queue/               Shared Celery configuration
  storage/             Provider-agnostic object storage interface and MinIO adapter
plugins/
  pdf_documents_tools/ PDF and document conversion plugins
  image_converter_tools/
    common_raster_conversions/ JPEG, PNG, WEBP, BMP, and TIFF tools
    heic_heif_conversions/     HEIC and HEIF tools
    avif_conversions/          AVIF tools
  image_to_text/       OCR plugin
infrastructure/         PostgreSQL, Redis, MinIO, and migrations
```

## Local setup

```bash
cp .env.example .env
docker compose -f infrastructure/compose.yaml up -d
uv sync
set -a
source .env
set +a
```

MinIO's object-storage API is available at `http://localhost:9000`; its browser console is
available at `http://localhost:9003`. The application creates the configured
bucket on first use in local development.

Apply migrations to an existing database volume:

```bash
docker compose -f infrastructure/compose.yaml exec -T postgres \
  psql -U app -d app < infrastructure/migrations/001_create_tool_jobs.sql
docker compose -f infrastructure/compose.yaml exec -T postgres \
  psql -U app -d app < infrastructure/migrations/003_add_job_options.sql
docker compose -f infrastructure/compose.yaml exec -T postgres \
  psql -U app -d app < infrastructure/migrations/004_add_google_auth.sql
docker compose -f infrastructure/compose.yaml exec -T postgres \
  psql -U app -d app < infrastructure/migrations/005_add_job_request_metadata.sql
```

Start the API and a generic worker:

```bash
uvicorn apps.api.main:app --reload
celery --app=apps.worker.celery_app:celery_app worker --loglevel=INFO
celery --app=apps.worker.celery_app:celery_app beat --loglevel=INFO
```

Start the frontend in another terminal:

```bash
cd apps/frontend
npm install
npm run dev
```

The worker uses Celery's default queue and can execute every registered plugin.
Install the two worker system dependencies on Debian or Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y libreoffice tesseract-ocr
```

LibreOffice handles Word, Excel, and PowerPoint to PDF. Tesseract handles OCR.
All other conversions use the Python dependencies installed by the project.

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

Create a Google OAuth 2.0 Web client and configure its public client ID for the
API in the root `.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8000
JWT_SECRET=replace-with-output-from-openssl
JWT_AUDIENCE=multiple-tools-web
FRONTEND_URL=http://localhost:5173
AUTH_COOKIE_SECURE=false
CORS_ORIGINS=http://localhost:5173
```

Generate the backend-only JWT secret with:

```bash
openssl rand -hex 32
```

The frontend does not include Google authentication. API clients can submit a
Google ID token to `POST /v1/auth/google`; the endpoint verifies it and returns
the application's bearer token.

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
OCR remains in `plugins/image_to_text/`. The registry discovers nested plugins automatically.
Shared plugin contracts and discovery live in `plugins/base.py` and
`plugins/registry.py`.

All plugins use the same Celery queue. Adding a plugin does not require API,
queue, or worker-task changes: add its package and ensure the worker has the
external programs that plugin needs.

## Object storage

API and worker processes use the same `ArtifactStorage` interface and exchange
only object keys such as `jobs/{job_id}/input.pdf`. The current provider is
MinIO, configured with `MINIO_ENDPOINT=localhost:9000` and the other
`MINIO_*` variables in `.env`.

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
