# Multiple Tools

An extensible asynchronous tool platform built with FastAPI, Celery, Redis,
PostgreSQL, and pluggable artifact storage.

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
  plugin_sdk/          Plugin contract, manifest, context, and discovery
  queue/               Shared Celery configuration
  storage/             Local and S3 artifact adapters
plugins/                Independently discoverable tool implementations
infrastructure/         Compose stack, PostgreSQL setup, and migrations
```

## Local setup

```bash
cp .env.example .env
docker compose -f infrastructure/compose.yaml up -d
python -m pip install -e .
```

Apply migrations to an existing database volume:

```bash
docker compose -f infrastructure/compose.yaml exec -T postgres \
  psql -U app -d app < infrastructure/migrations/001_create_tool_jobs.sql
```

Start the API and a generic worker:

```bash
uvicorn apps.api.main:app --reload
celery --app=apps.worker.celery_app:celery_app worker --loglevel=INFO
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
```

`pdf-to-jpg` and `pdf-to-png` return a ZIP containing one image per PDF page.

## API workflow

```bash
curl http://localhost:8000/v1/tools

curl -X POST \
  -H "Idempotency-Key: example-001" \
  -F "file=@document.pdf" \
  http://localhost:8000/v1/tools/pdf-to-word/jobs

curl http://localhost:8000/v1/jobs/JOB_ID
curl -OJ http://localhost:8000/v1/jobs/JOB_ID/output
```

Job states are `QUEUED`, `RUNNING`, `SUCCESS`, and `FAILED`.

## Adding a plugin

Create `plugins/my_tool/` with only `manifest.py` and `handler.py`. The registry
discovers the manifest and handler automatically. Shared plugin contracts and
discovery live in `plugins/base.py` and `plugins/registry.py`.

All plugins use the same Celery queue. Adding a plugin does not require API,
queue, or worker-task changes: add its package and ensure the worker has the
external programs that plugin needs.

Every API and worker instance must use the same storage backend. Local storage
is for single-host development. For distributed deployments, install `.[s3]`
and configure `STORAGE_BACKEND=s3`.

## Tests

```bash
python -m unittest discover -v
```
