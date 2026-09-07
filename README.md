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
LibreOffice and its `soffice` executable must be installed on any worker that
will run the Word-to-PDF plugin.

## API workflow

```bash
curl http://localhost:8000/v1/tools

curl -X POST \
  -H "Idempotency-Key: example-001" \
  -F "file=@document.pdf" \
  http://localhost:8000/v1/tools/pdf-to-word/jobs

curl http://localhost:8000/v1/jobs/JOB_ID
curl -OJ http://localhost:8000/v1/jobs/JOB_ID/output
curl -X POST http://localhost:8000/v1/jobs/JOB_ID/cancel
```

Job states are `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`, and `CANCELLED`.

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
