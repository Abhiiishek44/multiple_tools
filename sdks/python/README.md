# Multiple Tools Python SDK

Typed synchronous and asynchronous Python clients for the Multiple Tools HTTP
API. The SDK communicates only with the API and has no database, object storage,
Redis, Celery, or plugin dependencies.

## Installation

```bash
pip install multipletools
```

For local development from the repository root:

```bash
pip install ./sdks/python
```

## Usage

```python
from multipletools import Client

with Client(
    api_key="mt_live_...",
    base_url="https://api.example.com",
    timeout=60.0,
) as client:
    job = client.jobs.create(
        tool="pdf-to-word",
        file="document.pdf",
    )
    job = client.jobs.get(job.id)
    if job.status == "SUCCESS":
        client.jobs.download(job.id, "converted.docx")
```

`jobs.create` generates an idempotency key automatically. Pass
`idempotency_key=` to reuse one across an application-level retry, and pass
tool-specific settings with `options={...}`.

HTTP failures raise typed exceptions from `multipletools.exceptions`, including
authentication, permission, validation, not-found, conflict, rate-limit,
timeout, and connection errors.

## Conversion shortcuts

Named shortcuts create ordinary jobs, so polling and downloads continue to use
the existing jobs API:

```python
with Client(api_key="mt_live_...") as client:
    job = client.convert.pdf_to_word("document.pdf")
    completed = client.jobs.wait(job.id)
    if completed.status == "SUCCESS":
        client.jobs.download(completed.id, "converted.docx")
```

Every tool in the current catalog has a snake-case shortcut. For example,
`compress-pdf` is available as `client.convert.compress_pdf(...)`.
`AsyncClient.convert` exposes the same methods as awaitable calls. The generic
`client.jobs.create(...)` API remains available for forward compatibility.
